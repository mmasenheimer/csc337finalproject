// seed.js - Populate database with sample data
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    const db = client.db("bookstore");

    // Clear existing data
    await db.collection("books").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("carts").deleteMany({});

    // Insert sample books
    const books = [
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

    await db.collection("books").insertMany(books);
    console.log(`✓ Inserted ${books.length} books`);

    // Insert sample users
    const users = [
      {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        username: "testuser",
      },
      {
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
        username: "admin",
      },
    ];

    await db.collection("users").insertMany(users);
    console.log(`✓ Inserted ${users.length} users`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\nTest credentials:");
    console.log("Email: test@example.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase();
