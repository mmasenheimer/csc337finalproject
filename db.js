//This file exists to establish a single connection to the database,
//then export itself to every other portion of the code
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("bookstore");
    console.log("Connected to MongoDB");
  }
  return db;
}

function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
}

module.exports = { connectDB, getDB, client };
