import app from "./app";
import postRouter from "./routes/posts.routes";
import commentsRouter from "./routes/comments.routes";

// Define all routes here
app.get("/", (_, res) => res.status(200).json({ status: "API is running" }));
app.get("/test", (req, res) => res.status(200).json({ status: "OK" }));
app.get("/hello", (_, res) => res.status(200).json({ status: "ok" }));

app.use("/api/posts", postRouter);
app.use("/api/comments", commentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});