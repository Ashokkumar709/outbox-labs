import { Worker } from "bullmq";
import { Redis } from "ioredis";
import config from "./config";
import mongoose from "mongoose";
import { Email } from "./models/Email";
import axios from "axios";

const connection = new Redis(config.REDIS_URL);

async function initDb() {
  await mongoose.connect(config.MONGO_URI);
  console.log("[worker] connected to mongo");
}
initDb().catch(console.error);

const worker = new Worker(config.QUEUE_NAME, async (job) => {
  const data = job.data;
  // dedupe by messageId
  try {
    const existing = await Email.findOne({ messageId: data.messageId });
    if (existing) {
      console.log("[worker] duplicate messageId, skipping", data.messageId);
      return;
    }
    const emailDoc = new Email({
      accountId: data.accountId,
      messageId: data.messageId,
      subject: data.subject,
      from: data.from,
      to: data.to,
      date: data.date,
      text: data.text,
      html: data.html,
    });
    await emailDoc.save();
    console.log("[worker] saved email", emailDoc.messageId);

    // call search-service to index
    try {
      await axios.post(`${config.SEARCH_SERVICE_URL}/index`, {
        id: emailDoc._id,
        accountId: emailDoc.accountId,
        subject: emailDoc.subject,
        from: emailDoc.from,
        to: emailDoc.to,
        text: emailDoc.text,
        date: emailDoc.date,
        category: emailDoc.category,
      }, { timeout: 10000 });
      console.log("[worker] indexed email in search-service");
    } catch (err) {
      if (err instanceof Error) {
        console.error("[worker] error indexing to search-service", err.message);
      } else {
        console.error("[worker] error indexing to search-service", err);
      }
    }
  } catch (err) {
    console.error("[worker] job error", err);
    throw err;
  }
}, { connection });

worker.on("completed", (job) => console.log(`[worker] job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`[worker] job ${job?.id} failed`, err));
