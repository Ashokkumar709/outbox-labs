import express from "express";
import dotenv from "dotenv";
import accountsRouter from "./routes/accounts";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", accountsRouter);

app.get("/", (_, res) => {
  res.send("Service is running 🚀");
});

export default app;
