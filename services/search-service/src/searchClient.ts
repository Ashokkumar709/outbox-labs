import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const ELASTIC_URL = process.env.ELASTIC_URL || "http://elasticsearch:9200";
export const esClient = new Client({ node: ELASTIC_URL });
export const EMAIL_INDEX = process.env.EMAIL_INDEX || "emails";
