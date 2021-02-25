import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
// Routes import
import authRoutes from "./routes/auth";
import storyRoutes from "./routes/story";
import chapterRoutes from "./routes/chapter";
import userRoutes from "./routes/user"

// Utility imports
import trim from "./middleware/trim";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());

app.use(express.static("public"));
app.get("/", (_, res) => {
  res.json({
    message: "Hello World",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/chapter", chapterRoutes);
app.use("/api/user", userRoutes)

app.listen(PORT, async () => {
  console.log("Server running at http://localhost:5000");

  try {
    await createConnection();
    console.log("Database connected");
  } catch (err) {
    console.log(`Error : ${err}`);
  }
});
