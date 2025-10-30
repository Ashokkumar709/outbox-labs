import dotenv from "dotenv";
dotenv.config();
export default {
  MONGO_URI: process.env.MONGO_URI || "mongodb://mongo:27017/ai-support",
  REDIS_URL: process.env.REDIS_URL || "redis://redis:6379",
  QUEUE_NAME: process.env.QUEUE_NAME || "email:ingest",
  SEARCH_SERVICE_URL: process.env.SEARCH_SERVICE_URL || "http://search-service:5002",
  PORT: Number(process.env.PORT || 5004),
};
