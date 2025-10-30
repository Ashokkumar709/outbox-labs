import express from "express";
import axios from "axios";
const router = express.Router();

const SUPPORT_URL = process.env.SUPPORT_URL || "http://localhost:5001";

router.post("/accounts", async (req, res) => {
  try {
    const resp = await axios.post(`${SUPPORT_URL}/accounts`, req.body, { timeout: 10000 });
    res.send(resp.data);
  } catch (err: any) {
    res.status(500).send({ error: err.message || "failed" });
  }
});

export default router;
