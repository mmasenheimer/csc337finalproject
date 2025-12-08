const express = require("express");
const path = require("path");
const { connectDB, getDB, client } = require("./db");
const { attemptLogin, checkForExisting, createAccount, updateEmail, updatePassword, getUserById } = require("./services/user");
const multer = require('multer')
const {
  getUserCart,
  updateCartItemQuantity,
  removeFromCart,
  addToCart,
  clearCart,
  getCartTotal,
} = require("./services/cart");

const {
  getAllBooks,
  getBookByISBN,
  addBook,
  updateBook,
  deleteBook,
} = require("./services/book");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'book_imgs/'); // save to /book_imgs 
  },
  filename: (req, file, cb) => {
    const uniqueName = `_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
const app = express();
const PORT = 3030;

// ---------- DEFAULT BOOKS FOR SEEDING ----------
// These now match the ORIGINAL books from seed.js
const defaultBooks = [
  {
    isbn: "978-0-13-468599-1",
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 42.99,
  },
  {
    isbn: "978-0-135-95705-9",
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    price: 49.99,
  },
  {
    isbn: "978-0-596-52068-7",
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    price: 29.99,
  },
  {
    isbn: "978-1-449-33558-8",
    title: "Learning JavaScript Design Patterns",
    author: "Addy Osmani",
    price: 34.99,
  },
  {
    isbn: "978-0-201-63361-0",
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm",
    price: 54.99,
  },
];

// Ensure default books exist if collection is empty
async function ensureSeedBooks(db) {
  const count = await db.collection("books").countDocuments();
  if (count === 0) {
    await db.collection("books").insertMany(defaultBooks);
    console.log("Seeded default books into database.");
  } else {
    console.log(`Books collection already has ${count} documents. Skipping seed.`);
  }
}

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use("/book_imgs", express.static(path.join(__dirname, "book_imgs")));

// ---------- PAGE ROUTES ----------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/create_account", (req, res) => {
  res.sendFile(path.join(__dirname, "create_account.html"));
});

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "products.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});

// ---------- AUTH ENDPOINTS ----------

// Attempt login
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
        id: user.userId,
        name: user.name || user.username,
        type: user.type
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

// Create account
app.post("/create_account", async (req, res) => {
  const { name, email, password } = req.body;
  const db = getDB();

  try {
    const existing = await checkForExisting(db, email);

    if (existing) {
      return res.status(401).json({
        success: false,
        error: "Account already exists",
      });
    }

    try {
      await createAccount(db, name, email, password);
      return res.json({
        success: true,
        message: "Account created successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to create account",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
});

// ---------- BOOK ENDPOINTS ----------

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

app.post("/api/books", upload.single('image'), async (req, res) => {
  try {
    const bookData = {
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
      price: parseFloat(req.body.price)
    };
    if (req.file) {
      bookData.imageUrl = `/book_imgs/${req.file.filename}`;
    }
    
    const book = await addBook(getDB(), bookData);
    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Admin: Update book
app.put("/api/books/:isbn", upload.single('image'), async (req, res) => {
  try {
    const bookData = {
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
      price: parseFloat(req.body.price) 
    };
    if (req.file) {
      bookData.imageUrl = `/book_imgs/${req.file.filename}`;
    }
    
    const book = await updateBook(getDB(), req.params.isbn, bookData);
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

// ---------- CART ENDPOINTS ----------

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
// ---------- PROFILE ENDPOINTS ----------
app.get("/api/users/:userId", async (req, res) => {
  try {
    const db = getDB();
    const userId = parseInt(req.params.userId);
    const user = await getUserById(db, userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        type: user.type
      },
    });
  } catch (err) {
    console.error("GET /api/users/:userId error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Update email
app.put("/api/users/:userId/email", async (req, res) => {
  try {
    const db = getDB();
    const userId = parseInt(req.params.userId);
    const { newEmail } = req.body;

    await updateEmail(db, userId, newEmail);

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/users/:userId/email error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update password
app.put("/api/users/:userId/password", async (req, res) => {
  try {
    const db = getDB();
    const userId = parseInt(req.params.userId);
    const { oldPassword, newPassword } = req.body;

    await updatePassword(db, userId, oldPassword, newPassword);

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/users/:userId/password error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});


// ---------- SERVER STARTUP ----------

connectDB().then(async () => {
  const db = getDB();
  await ensureSeedBooks(db); // seed default books if needed

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
