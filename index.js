import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";

dotenv.config({ path: "./.env" });

const port = 5000;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Ok");
});

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
