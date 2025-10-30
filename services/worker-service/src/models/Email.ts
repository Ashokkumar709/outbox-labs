import mongoose, { Schema } from "mongoose";

const EmailSchema = new Schema({
  accountId: { type: String, index: true },
  messageId: { type: String, unique: true, index: true },
  subject: String,
  from: Array,
  to: Array,
  date: Date,
  text: String,
  html: String,
  category: { type: String, default: "Uncategorized" },
  createdAt: { type: Date, default: () => new Date() },
}, { timestamps: true });

export const Email = mongoose.model("Email", EmailSchema);
