// Create collections
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "username", "password"],
      properties: {
        userId: { bsonType: "string" },
        username: { bsonType: "string" },
        password: { bsonType: "string" },
      },
    },
  },
});

db.createCollection("books");
db.createCollection("carts");

db.users.createIndex({ username: 1 }, { unique: true });
db.books.createIndex({ isbn: 1 }, { unique: true });
db.carts.createIndex({ userId: 1 });

// Sample user
const sampleUser = {
  userId: "user001",
  username: "johndoe",
  password: "hashedPassword123",
};

// Sample book
const sampleBook = {
  isbn: "978-0-7432-7356-5",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
};

// Sample cart
const sampleCart = {
  userId: "user001",
  books: [
    {
      isbn: "978-0-7432-7356-5",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
    },
    {
      isbn: "978-0-061-96436-7",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
    },
  ],
};

// Insert samples
// (uncomment to use them)
// db.users.insertOne(sampleUser);
// db.books.insertOne(sampleBook);
// db.carts.insertOne(sampleCart);
