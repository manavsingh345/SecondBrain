// worker.ts (improved)
import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import PDFfile from "../models/PDFfile.js";
import Linkfile from "../models/Linkfile.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";

dotenv.config();

mongoose.connect(process.env.MONGO_URL!)
  .then(() => console.log("Worker connected to DB"))
  .catch(err => console.error("Worker DB error:", err));

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("Job received:", job.id);
    
    // Accept both object or JSON string payloads
    let data: any;
    console.log("RAW JOB DATA:", job.data);
    try {
      data = (typeof job.data === "string") ? JSON.parse(job.data) : job.data;
    } catch (err) {
      console.error("Failed to parse job.data:", err, "raw:", job.data);
      return;
    }

    const { type = "pdf", pdfId, userId, filename, path: fileUrl, text, videoId , linkId} = data;
    let docs;

    if (type === "pdf" && (!pdfId || !userId || !fileUrl)) {
      console.error("Missing required job fields. Received:", { pdfId, userId, filename, fileUrl });
      return;
    }
    //youtube
    if (type === "youtube") {
      if (!text || !userId || !videoId) {
        console.error("Missing youtube job fields");
        return;
      }
      docs = [
            {
              pageContent: text,
              metadata: {
                type: "youtube",
                videoId: videoId.toString(),
                userId: userId.toString()
              }
            }
          ];
           console.log("YouTube transcript received, length:", text.length);
          }

          if (type === "link") {
  if (!text || !userId || !linkId) {
    console.error("Missing link job fields");
    return;
  }

  docs = [
    {
      pageContent: text,
      metadata: {
        type: "link",
        linkId: linkId.toString(),
        userId: userId.toString()
      }
    }
  ];

  console.log("Link content received, length:", text.length);
}


     
   if(type === "pdf"){ 
    console.log("Processing pdfId:", pdfId, "userId:", userId, "filename:", filename, "url:", fileUrl);

    // Step 1: download remote file to temp
    const tmpFile = path.join(os.tmpdir(), `file-${Date.now()}-${encodeURIComponent(filename || "file")}`);
    try {
      const response = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 60_000 });
      if (!response.data || response.data.byteLength === 0) {
        console.error("Downloaded file is empty.");
        return;
      }
      fs.writeFileSync(tmpFile, Buffer.from(response.data));
      console.log("Downloaded file size:", fs.statSync(tmpFile).size, "bytes ->", tmpFile);
    } catch (err) {
      console.error("Error downloading file:", err);
      return;
    }

    // Step 2: pick loader
    let loader;
    const lower = (filename || "").toLowerCase();
    try {
      if (lower.endsWith(".pdf")) loader = new PDFLoader(tmpFile);
      else if (lower.endsWith(".docx")) loader = new DocxLoader(tmpFile);
      else if (lower.endsWith(".pptx")) loader = new PPTXLoader(tmpFile);
      else {
        console.error("Unsupported file type:", filename);
        fs.unlinkSync(tmpFile);
        return;
      }
    } catch (err) {
      console.error("Error creating loader:", err);
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      return;
    }

    // Step 3: load and extract text
    try {
      docs = await loader.load();
      console.log("Loader returned docs count:", Array.isArray(docs) ? docs.length : 0);
    } catch (err) {
      console.error("Error loading/ parsing file:", err);
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      return;
    }

    // remove temp file asap
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch(e){}

    // If no text extracted -> log and exit
    if (!docs || (Array.isArray(docs) && docs.length === 0)) {
      console.error("No documents extracted from file. Marking as not embedded.");
      await PDFfile.findByIdAndUpdate(pdfId, { embedded: false }).catch(()=>{});
      return;
    }
  }

    // Step 4: split into chunks
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 400, chunkOverlap: 100 });
    let splitDocs;
    try {
      if(!docs) {
        console.log("No documents available to split");
        return;
      }
      splitDocs = await splitter.splitDocuments(docs);
      console.log("Split into chunks:", splitDocs.length);
    } catch (err) {
      console.error("Error splitting documents:", err);
      if (type === "pdf" && pdfId) {
         await PDFfile.findByIdAndUpdate(pdfId, { embedded: false }).catch(() => {});
      }

      return;
    }

    if (!splitDocs || splitDocs.length === 0) {
      console.error("Splitter returned zero chunks.");
      if(type === "pdf" && pdfId) await PDFfile.findByIdAndUpdate(pdfId, { embedded: false }).catch(()=>{});
      return;
    }

    // Add metadata
    // splitDocs = splitDocs.map(d => ({
    //   ...d,
    //   metadata: {
    //     ...(d.metadata || {}),
    //     pdfId: pdfId.toString(),
    //     userId: userId.toString()
    //   }
    // }));

    splitDocs = splitDocs.map(d => ({
      ...d,
      metadata: {
        ...(d.metadata || {}),
          userId: userId.toString(),
          type,
          ...(type === "pdf" && pdfId && { pdfId: pdfId.toString() }),
          ...(type === "youtube" && videoId && { videoId: videoId.toString() }),
          ...(type === "link" && linkId && { linkId: linkId.toString() })
        }
    }));

    // Step 5: embeddings + Qdrant
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: process.env.GENAI_EMBEDDING_MODEL || "text-embedding-004",
      apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_RAG_KEY || "",
    });

    const collectionName = `user_${userId}`;

    let vectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName,
      });
    } catch (err) {
      console.error("Qdrant fromExistingCollection failed:", err);
      // you may choose to create collection here or abort
      if (type === "pdf" && pdfId) {
        await PDFfile.findByIdAndUpdate(pdfId, { embedded: false }).catch(() => {});
      }
      return;
    }

    // Step 6: delete old vectors for this PDF
    if (type === "pdf" && pdfId) {
      try {
        await vectorStore.client.delete(collectionName, {
          filter: {
            must: [
              { key: "metadata.pdfId", match: { value: pdfId.toString() } }
            ]
          }
        });
        console.log("Old vectors removed for pdf:", pdfId);
      } catch (err) {
        console.warn("Failed to delete old vectors (continuing):", err);
      }
    }

    //delete old vectors of links
      if (type === "link" && linkId) {
        try {
          await vectorStore.client.delete(collectionName, {
            filter: {
              must: [
                { key: "metadata.linkId", match: { value: linkId.toString() } }
              ]
            }
          });
          console.log("Old vectors removed for link:", linkId);
        } catch (err) {
          console.warn("Failed to delete old link vectors (continuing):", err);
        }
    }



    // Step 7: add vectors
    try {
      await vectorStore.addDocuments(splitDocs);
    } catch (err) {
      console.error("Failed to add documents to vector store:", err);
      if (type === "pdf" && pdfId) {
        await PDFfile.findByIdAndUpdate(pdfId, { embedded: false }).catch(() => {});
      }
      return;
    }

    // Step 8: mark embedded = true in DB
    try {
     if(type==="pdf"){
        await PDFfile.findByIdAndUpdate(pdfId, { embedded: true });
        console.log("PDF chunks stored in Qdrant for:", pdfId);
     } 
     if (type === "link" && linkId) {
        await Linkfile.findByIdAndUpdate(linkId, { embedded: true }).catch(() => {});
        console.log("Link chunks stored in Qdrant for:", linkId);
    }

    } catch (err) {
      console.error("Failed to update PDF document embedded flag:", err);
    }
  },
  {
    concurrency: 10,
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    },
  }
);

export default worker;
