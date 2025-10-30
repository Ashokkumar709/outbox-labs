import express from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { startImapSync, ImapAccount } from "./imapClient";
import config from "./config";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

// lightweight storage for dev: services/support-service/data/accounts.json
const ACCOUNTS_FILE = path.join(__dirname, "../data/accounts.json");
if (!fs.existsSync(path.join(__dirname, "../data"))) fs.mkdirSync(path.join(__dirname, "../data"));
if (!fs.existsSync(ACCOUNTS_FILE)) fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify([]));

app.post("/accounts", async (req, res) => {
  const { user, password, host, port = 993, tls = true, mailbox = "INBOX" } = req.body;
  if (!user || !host) return res.status(400).send({ error: "user and host required" });
  const account: ImapAccount = { id: uuidv4(), user, password, host, port, tls, mailbox };
  const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf-8"));
  accounts.push(account);
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
  // start syncing immediately
  startImapSync(account).catch((e) => console.error("startImapSync", e));
  res.send({ ok: true, accountId: account.id });
});

app.get("/", (_, res) => {
  res.send("Service is running 🚀");
});

export default app;
