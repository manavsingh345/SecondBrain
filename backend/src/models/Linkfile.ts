import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: String,
  embedded: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId,  ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Linkfile", LinkSchema);
