const express = require("express");
const { connectDB, getDB, client } = require("./db");
const { attemptLogin } = require("./user");

const {
  getAllBooks,
  getBookByISBN,
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  addBook,
  updateBook,
  deleteBook,
} = require("./carts");

const app = express();
const PORT = 3030;

// Middleware
app.use(express.json());

// ============ PAGES ============

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

// ============ AUTH ENDPOINTS ============

//attempt login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await attemptLogin(getDB(), email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid login credentials",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name || user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

// ============ BOOK ENDPOINTS ============

// Get all books
app.get("/api/books", async (req, res) => {
  try {
    const books = await getAllBooks(getDB());
    res.json({ success: true, books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: false, error: "Failed to fetch books" });
  }
});

// Get single book by ISBN
app.get("/api/books/:isbn", async (req, res) => {
  try {
    const book = await getBookByISBN(getDB(), req.params.isbn);

    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ success: false, error: "Failed to fetch book" });
  }
});

// Admin: Add new book
app.post("/api/books", async (req, res) => {
  try {
    const book = await addBook(getDB(), req.body);
    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Admin: Update book
app.put("/api/books/:isbn", async (req, res) => {
  try {
    const book = await updateBook(getDB(), req.params.isbn, req.body);
    res.json({ success: true, book });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Admin: Delete book
app.delete("/api/books/:isbn", async (req, res) => {
  try {
    const result = await deleteBook(getDB(), req.params.isbn);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ CART ENDPOINTS ============

// Get user's cart
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const cart = await getUserCart(getDB(), req.params.userId);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, error: "Failed to fetch cart" });
  }
});

// Add book to cart
app.post("/api/cart/:userId/add", async (req, res) => {
  try {
    const cart = await addToCart(getDB(), req.params.userId, req.body);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update cart item quantity
app.put("/api/cart/:userId/update", async (req, res) => {
  try {
    const { isbn, quantity } = req.body;
    const cart = await updateCartItemQuantity(
      getDB(),
      req.params.userId,
      isbn,
      quantity
    );
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Remove book from cart
app.delete("/api/cart/:userId/remove/:isbn", async (req, res) => {
  try {
    const cart = await removeFromCart(
      getDB(),
      req.params.userId,
      req.params.isbn
    );
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Clear cart
app.delete("/api/cart/:userId/clear", async (req, res) => {
  try {
    const cart = await clearCart(getDB(), req.params.userId);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, error: "Failed to clear cart" });
  }
});

// Get cart total
app.get("/api/cart/:userId/total", async (req, res) => {
  try {
    const totals = await getCartTotal(getDB(), req.params.userId);
    res.json({ success: true, ...totals });
  } catch (error) {
    console.error("Error calculating total:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to calculate total" });
  }
});

// ============ SERVER STARTUP ============

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
