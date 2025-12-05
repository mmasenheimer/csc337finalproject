const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3030;

// Middleware
app.use(express.json());

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db("bookstore");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Routes

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Bookstore API is running" });
});

// User routes
app.post("/users", async (req, res) => {
  try {
    const { userId, username, password } = req.body;
    const result = await db
      .collection("users")
      .insertOne({ userId, username, password });
    res
      .status(201)
      .json({ message: "User created", userId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/users/:username", async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book routes
app.post("/books", async (req, res) => {
  try {
    const { isbn, title, author } = req.body;
    const result = await db
      .collection("books")
      .insertOne({ isbn, title, author });
    res
      .status(201)
      .json({ message: "Book created", bookId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/books", async (req, res) => {
  try {
    const books = await db.collection("books").find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/books/:isbn", async (req, res) => {
  try {
    const book = await db
      .collection("books")
      .findOne({ isbn: req.params.isbn });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cart routes
app.post("/carts", async (req, res) => {
  try {
    const { userId, books } = req.body;
    const result = await db
      .collection("carts")
      .insertOne({ userId, books: books || [] });
    res
      .status(201)
      .json({ message: "Cart created", cartId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/carts/:userId", async (req, res) => {
  try {
    const cart = await db
      .collection("carts")
      .findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/carts/:userId/books", async (req, res) => {
  try {
    const { userId } = req.params;
    const book = req.body;

    const result = await db
      .collection("carts")
      .updateOne({ userId }, { $push: { books: book } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ message: "Book added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
