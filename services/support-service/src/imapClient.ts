import { connect, ImapSimpleOptions } from "imap-simple";
import { simpleParser } from "mailparser";
import { Redis } from "ioredis";
import { Queue } from "bullmq";
import config from "./config";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export type ImapAccount = {
  id: string;
  user: string;
  password?: string;
  host: string;
  port: number;
  tls: boolean;
  mailbox?: string; // typically 'INBOX'
};

const redis = new Redis(config.REDIS_URL);
const queue = new Queue(config.QUEUE_NAME, { connection: redis });

function imapConfigFromAccount(account: ImapAccount): ImapSimpleOptions {
  return {
    imap: {
      user: account.user,
      password: account.password,
      host: account.host,
      port: account.port,
      tls: account.tls,
      authTimeout: 30000,
      tlsOptions: { rejectUnauthorized: false },
    },
  } as any;
}

export async function startImapSync(account: ImapAccount) {
  const cfg = imapConfigFromAccount(account);
  const connection = await connect(cfg);
  console.log(`[imap] connected for ${account.user}`);

  // fetch last 30 days messages on initial connect
  await fetchLast30Days(connection, account);

  // open mailbox for IDLE
  await connection.openBox(account.mailbox || "INBOX");

  connection.on("mail", async (numNewMsgs) => {
    console.log(`[imap] new mail event: ${numNewMsgs} for ${account.user}`);
    // search for unseen messages
    const searchCriteria = ["UNSEEN"];
    const fetchOptions = { bodies: [""], markSeen: false };

    const results = await connection.search(searchCriteria, fetchOptions);
    for (const res of results) {
      const all = res.parts.find((p: any) => p.which === "");
      if (!all) {
        console.warn('[imap] Message parts not found');
        continue;
      }
      const id = uuidv4();
      const parsed = await simpleParser(all.body);
      // push to queue
      await queue.add("ingest", {
        accountId: account.id,
        messageId: parsed.messageId || id,
        subject: parsed.subject,
        from: (Array.isArray(parsed.from) ? parsed.from.flatMap((a: any) => a.value) : parsed.from?.value) || [],
        to: (Array.isArray(parsed.to) ? parsed.to.flatMap((a: any) => a.value) : parsed.to?.value) || [],
        date: parsed.date,
        text: parsed.text,
        html: parsed.html,
      }, { removeOnComplete: true, removeOnFail: false });
      console.log(`[imap] enqueued new msg ${parsed.messageId || id}`);
    }
  });

  // handle errors and reconnect logic
  connection.on("error", (err: any) => {
    console.error("[imap] connection error", err);
  });

  connection.on("close", async () => {
    console.warn(`[imap] connection closed for ${account.user} — attempting reconnect in 5s`);
    setTimeout(() => startImapSync(account).catch(console.error), 5000);
  });
}

async function fetchLast30Days(connection: any, account: ImapAccount) {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const searchCriteria = [["SINCE", since.toISOString()]];
    const fetchOptions = { bodies: [""], markSeen: false };
    await connection.openBox(account.mailbox || "INBOX");
    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`[imap] fetched ${messages.length} messages for ${account.user}`);
    for (const res of messages) {
      const all = res.parts.find((p: any) => p.which === "");
      if (!all) {
        console.warn('[imap] Message parts not found during fetch');
        continue;
      }
      const parsed = await simpleParser(all.body);
      const id = uuidv4();
      await queue.add("ingest", {
        accountId: account.id,
        messageId: parsed.messageId || id,
        subject: parsed.subject,
        from: (Array.isArray(parsed.from) ? parsed.from.flatMap((a: any) => a.value) : parsed.from?.value) || [],
        to: (Array.isArray(parsed.to) ? parsed.to.flatMap((a: any) => a.value) : parsed.to?.value) || [],
        date: parsed.date,
        text: parsed.text,
        html: parsed.html,
      }, { removeOnComplete: true, removeOnFail: false });
    }
  } catch (err) {
    console.error("[imap] fetchLast30Days error", err);
  }
}
