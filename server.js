const express = require("express");
const { connectDB, getDB, client } = require("./db");
const { attemptLogin } = require("./user");
const app = express();
const PORT = 3030;


// Middleware
app.use(express.json());

// Routes
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