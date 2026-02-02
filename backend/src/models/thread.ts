import mongoose, { Schema } from "mongoose";

const MessageSchema=new Schema({
    role:{type:String, required:true},
    content:{type:String,default:""},
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    videoId: { type: String, default: null },
    videoUrl: { type: String, default: null },
    TimeStamp:{type:Date,default:Date.now},
});

const ThreadSchema=new Schema({
    threadId:{type:String,required:true},
    title:{type:String,default:"New Chat By Default"},
    messages:[MessageSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pdfId: [{ type: mongoose.Schema.Types.ObjectId, ref: "PdfFile" }], 
    youtubeIds: [{ type: String }], 
    linkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Linkfile" }],
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
    
});

export default mongoose.model("Thread",ThreadSchema);
