const express = require("express");
const { connectDB, getDB, client } = require("./db");
const { attemptLogin } = require("./user");
const app = express();
const PORT = 3030;


// Middleware
app.use(express.json());

<<<<<<< HEAD
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

// Routes for API calls

// Health check
=======
// Routes
>>>>>>> 636d1f3c2300c823b598b63ada7b4280845e41d6
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});



// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});


//attempt login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await attemptLogin(getDB(), email, password);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid login credentials" 
      });
    }

    res.json({ 
      success: true,
      user: { 
        id: user._id.toString(),
        name: user.name || user.username 
      } 
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
});


app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});


// Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

//TODO : Split this file into multiple pieces, will become overwhelming
