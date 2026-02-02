import express from "express";
import thread from "../models/thread.js";
const router = express.Router();
import generateOpenAiResponse from "../utils/openai.js";
import { authMiddleware } from "../middleware.js";
import 'dotenv/config';
import multer from 'multer';
import {Job, Queue} from "bullmq";
import { GoogleGenerativeAIEmbeddings,ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import cloudinary from "../uploadCloudinary.js";
import { YoutubeTranscript } from "youtube-transcript";
import fs from "fs"
import axios from "axios";
import cors from 'cors'
import { generateTitleFromMessage } from "../utils/summary.js";
import PDFfile from "../models/PDFfile.js";
import Linkfile from "../models/Linkfile.js";
import * as cheerio from "cheerio";
const app=express();
app.use(cors())

const queue=new Queue("file-upload-queue",{
  connection: {
      host: 'localhost',  // or process.env.VALKEY_HOST
      port: 6379          // or process.env.VALKEY_PORT
    }
});



//Get all threads
router.get("/thread",authMiddleware,async (req,res)=>{
    try{
        const threads = await thread.find({userId: req.userId }).sort({ updatedAt: -1 });
        res.json(threads);
    }catch(e){
        res.json({
            message: "Failed to fetch threads"
        })
    }
});

//Get particular thread when you click on it it show on the page
router.get("/thread/:threadId",authMiddleware,async (req,res)=>{
    const {threadId}=req.params;
    try{
        const th=await thread.findOne({threadId,userId:req.userId});
        if(!th){
            res.json({
                message:"ThreadId not found"
            })
        }
        res.json(th?.messages);
    }catch(e){
        res.json({
            message:"Error will accessing threadId"
        })
    }
});

router.delete("/thread/:threadId",authMiddleware,async(req,res)=>{
    const {threadId}=req.params;
    try{
        const deletethread=await thread.findOneAndDelete({threadId,userId:req.userId});
        if(!deletethread){
            res.status(404).json({error:"Thread is not found"});
        }
        res.status(200).json({success: "thread is deleted"})
    }catch(e){
        console.log(e);
        res.json({
            e:"Error will deleting the thread"
        })
    }
});


//pdf
const upload = multer({ dest: "uploads/" }); 
router.post('/upload/pdf', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    const userId = req.userId;
    const originalName = req.file?.originalname;

    // 1 Upload to Cloudinary
    const localpath = req.file?.path;
    const cloudUpload = await cloudinary.uploader.upload(localpath!, {
      folder: "pdfs",
      resource_type: "raw"
    });
    if(localpath) fs.unlinkSync(localpath);

    // 2 Check if this PDF was uploaded before by same user
    let pdf = await PDFfile.findOne({ userId, originalName });

    if (pdf) {
      console.log("Same PDF uploaded again → reusing pdfId:", pdf._id);
      // update cloud path
      pdf.path = cloudUpload.secure_url;
      pdf.filename = cloudUpload.public_id;
      pdf.embedded = false; // re-embed required
      await pdf.save();
    } else {
      console.log("New PDF uploaded → creating new pdfId");
      pdf = await PDFfile.create({
        originalName,
        filename: cloudUpload.public_id,
        path: cloudUpload.secure_url,
        embedded: false,
        userId
      });
    }

    // 3 Link PDF to thread
    let { threadId, message } = req.body;
    let th;

    if (threadId) {
      th = await thread.findOne({ threadId, userId });

      if (!th) {
        const shortTitle = await generateTitleFromMessage(message);
        th = new thread({ threadId, title: shortTitle, messages: [], pdfId: [pdf._id], userId });
      } else {
        if (!th.pdfId.includes(pdf._id)) th.pdfId.push(pdf._id);
        th.updatedAt = new Date();
      }
      await th.save();
    } else {
      const newThreadId = Date.now().toString();
      th = new thread({ threadId: newThreadId, title: "New Thread", messages: [], pdfId: [pdf._id], userId });
      await th.save();
    }

    // 4 Send job to worker
    await queue.add("file-upload-queue", {
        type: "pdf",
        pdfId: pdf._id.toString(),
        userId,
        filename: originalName,
        path: cloudUpload.secure_url
    });


    // 5  SAVE a message for this uploaded PDF in the thread history
   th.messages.push({
    role: "user",
    content: "", // optional text like "uploaded a PDF"
    fileUrl: cloudUpload.secure_url,
    fileName: originalName
  });

  await th.save();

    return res.json({
      message: pdf.embedded
        ? "PDF updated and re-embedding started."
        : "PDF uploaded successfully. Embedding started.",
      pdfId: pdf._id,
      path: cloudUpload.secure_url,
      filename: originalName
    });

  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json({ error: "Failed to upload PDF" });
  }
});

//Youtube
router.post("/youtube", authMiddleware, async (req, res) => {
  function extractVideoId(url:any) {
  const patterns = [
    /v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /shorts\/([^?]+)/,
    /embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

  try {
    const { url, threadId } = req.body;
    if (!url) return res.status(400).json({ message: "YouTube URL required" });

    const videoId = extractVideoId(url);
if (!videoId) {
  return res.status(400).json({ message: "Invalid YouTube URL" });
}

    let transcript;
try {
  transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
} catch {
  transcript = await YoutubeTranscript.fetchTranscript(videoId);
}

    if (!transcript || transcript.length === 0) {
      console.log("transcript have length 0");
      return res.status(400).json({
        message: "This video has captions, but transcript could not be extracted"
      });
    }
    const fullText = transcript.map(t => t.text).join(" ");

    let th = threadId
      ? await thread.findOne({ threadId, userId: req.userId })
      : null;

    if (!th) {
      th = new thread({
        threadId: Date.now().toString(),
        title: "YouTube Chat",
        messages: [],
        youtubeIds: [videoId],
        userId: req.userId
      });
    } else {
      if (!th.youtubeIds?.includes(videoId)) {
        th.youtubeIds.push(videoId);
      }
    }

    th.messages.push({
      role: "user",
      content: "Uploaded a YouTube video",
      videoId,
      videoUrl: url
    });

    await th.save();
      console.log("QUEUEING YOUTUBE JOB", {
      videoId,
      textLength: fullText.length,
    });
    console.log({
  videoId,
  transcriptLength: transcript?.length,
  firstLine: transcript?.[0]?.text
});


    await queue.add("file-upload-queue", {
      type: "youtube",
      videoId,
      text: fullText,
      userId: req.userId
    });

    res.json({
      success: true,
      threadId: th.threadId,
      message: "YouTube video processing started"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to process YouTube video" });
  }
});

// Link
router.post("/upload/link", authMiddleware, async (req, res) => {
  try {
    const { url, threadId, message } = req.body;
    const userId = req.userId;

    if (!url) return res.status(400).json({ error: "URL required" });

    // 1 Fetch HTML
    const html = await axios.get(url).then(r => r.data);

    // 2 Extract text (Cheerio first)
    const $ = cheerio.load(html);
    let text = $("body").text().replace(/\s+/g, " ").trim();

    if (text.length < 200) {
      return res.status(400).json({
        error: "This link does not expose readable text"
      });
    }

    // 3 Save link
    const link = await Linkfile.create({
      url,
      title: $("title").text() || url,
      embedded: false,
      userId
    });

    // 4 Attach to thread
    let th;
    if (threadId) {
      th = await thread.findOne({ threadId, userId });
      if (!th) {
        th = new thread({
          threadId,
          title: "Link Chat",
          messages: [],
          linkIds: [link._id],
          userId
        });
      } else {
        th.linkIds = th.linkIds || [];
        th.linkIds.push(link._id);
        th.updatedAt = new Date();
      }
    } else {
      th = new thread({
        threadId: Date.now().toString(),
        title: "Link Chat",
        messages: [],
        linkId: [link._id],
        userId
      });
    }

    await th.save();

    // 5 Push job to queue
    await queue.add("file-upload-queue", {
      type: "link",
      text,
      linkId: link._id,
      userId
    });

    res.json({
      success: true,
      linkId: link._id,
      preview: text.slice(0, 300)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process link" });
  }
});


// Get all uploaded PDFs (for history)
router.get("/pdf/history", authMiddleware,async (req, res) => {
  try {
    const pdfs = await PDFfile.find({userId:req.userId}).sort({ uploadedAt: -1 });
    res.json(pdfs);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    res.status(500).json({ message: "Error fetching uploaded PDFs" });
  }
});

router.post("/chat1", authMiddleware,async (req, res) => {
  let { threadId, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!threadId) {
    threadId = Date.now().toString();
  }

  try {
    // Fetch or create thread
    let th = await thread.findOne({ threadId, userId: req.userId});
    if (!th) {
      const shortTitle = await generateTitleFromMessage(message);
      th = new thread({
        userId:req.userId,
        threadId,
        title: shortTitle,
        messages: [{ role: "user", content: message }],
      });
      await th.save();
    } else {
      th.messages.push({ role: "user", content: message });
      await th.save();
    }

    let assistantReply;

    const hasPDFs = Array.isArray(th.pdfId) && th.pdfId.length > 0;
    const hasYoutube = Array.isArray(th.youtubeIds) && th.youtubeIds.length > 0;
    const hasLinks = Array.isArray(th.linkIds) && th.linkIds.length > 0;


      if (hasPDFs || hasYoutube || hasLinks) {
        console.log("Context found → using Gemini with vector search");
        const embeddings = new GoogleGenerativeAIEmbeddings({
                 model: "text-embedding-004",
                 apiKey: process.env.GEMINI_RAG_KEY || "",
        });

      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: "http://localhost:6333",
          collectionName: `user_${req.userId}`,
        }
      );
      const mustFilters: any[] = [
        { key: "metadata.userId", match: { value: req.userId } }
      ];

      const shouldFilters: any[] = [];

      // PDFs
      if (hasPDFs) {
        shouldFilters.push(
          ...th.pdfId.map(id => ({
            key: "metadata.pdfId",
            match: { value: id.toString() }
          }))
        );
      }

      // YouTube
      if (hasYoutube) {
        shouldFilters.push(
          ...th.youtubeIds.map(id => ({
            key: "metadata.videoId",
            match: { value: id }
          }))
        );
      }

      //links
      if (hasLinks) {
        shouldFilters.push(
          ...th.linkIds.map(id => ({
            key: "metadata.linkId",
            match: { value: id.toString() }
          }))
        );
      }


      const filter = {
        must: mustFilters,
        should: shouldFilters
      };
      const results = await vectorStore.similaritySearch(message, 6, filter);

  

      // 2️ System prompt
      const contextText = results.map(r => r.pageContent).join("\n\n");
      const SYSTEM_PROMPT = `
          You are SecondBrain — a personal knowledge assistant.

          Your job is to answer the user's question using the provided context, which may come from:
          - Uploaded PDFs
          - YouTube video transcripts
          - Web links or articles
          - Tweets or social posts
          - Notes saved by the user

          Rules:
          1. Always prioritize the provided context when answering.
          2. If the answer is clearly present in the context, use it directly.
          3. If the context is partially relevant, combine it with your general knowledge.
          4. If the context does not contain the answer at all, answer using general knowledge — naturally and confidently.
          5. Never mention phrases like "based on the context", "context not provided", or "the document says".
          6. If multiple sources are present, synthesize them into a single clear answer and complete answer.
          7. Keep responses clear, concise, and helpful — like a smart second brain.

          Context:
          ${contextText}
        `;


      // 3 Gemini chat
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_RAG_KEY || "",
      });

      const response = await model.invoke([
        ["system", SYSTEM_PROMPT],
        ["human", message],
      ]);

       if (typeof response.content === "string") {
        assistantReply = response.content;
      } else if (Array.isArray(response.content)) {
        assistantReply = response.content
           .map((block) => ("text" in block ? block.text : ""))
          .join("");
      } else {
        assistantReply = "Sorry, I couldn’t generate a proper response.";
      }
    } else {
      console.log("No PDFs/Youtube → using standard OpenAI reply");
      assistantReply = await generateOpenAiResponse(message);
    }

    // --- Save and return ---
    th.messages.push({ role: "assistant", content: assistantReply });
    th.updatedAt = new Date();
    await th.save();

    res.json({ reply: assistantReply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error while sending message" });
  }
});


export default router;