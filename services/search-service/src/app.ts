import express from "express";
import dotenv from "dotenv";
import { esClient, EMAIL_INDEX } from "./searchClient";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/index", async (req, res) => {
  const body = req.body;
  if (!body || !body.id) return res.status(400).send({ error: "invalid payload" });
  try {
    // ensure index exists
    const exists = await esClient.indices.exists({ index: EMAIL_INDEX });
    if (!exists) {
      await esClient.indices.create({
        index: EMAIL_INDEX,
        mappings: {
          properties: {
            subject: { type: "text" },
            from: { type: "text" },
            to: { type: "text" },
            text: { type: "text" },
            accountId: { type: "keyword" },
            date: { type: "date" },
            category: { type: "keyword" },
          },
        },
      });
    }
    await esClient.index({
      index: EMAIL_INDEX,
      id: body.id,
      body: {
        subject: body.subject,
        from: JSON.stringify(body.from || []),
        to: JSON.stringify(body.to || []),
        text: body.text,
        accountId: body.accountId,
        date: body.date,
        category: body.category,
      },
      refresh: true,
    });

    return res.send({ ok: true });
  } catch (err) {
    console.error("index error", err);
    return res.status(500).send({ error: "index failed" });
  }
});

app.get("/", (_, res) => {
  res.send("Service is running 🚀");
});

export default app;
