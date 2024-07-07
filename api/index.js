import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "../routes/index.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Ok");
});

app.use(router);

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
});
