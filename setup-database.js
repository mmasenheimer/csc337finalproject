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

const bookList = [
  {
    isbn: "978-0-141-43951-8",
    title: "1984",
    author: "George Orwell",
    price: 16.50
  },
  {
    isbn: "978-0-544-27299-6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 22.00
  },
  {
    isbn: "978-0-375-70667-7",
    title: "No Country for Old Men",
    author: "Cormac McCarthy",
    price: 15.99
  },
  {
    isbn: "978-0-307-74365-9",
    title: "The Stand",
    author: "Stephen King",
    price: 18.99
  },
  {
    isbn: "978-0-7653-7654-2",
    title: "Dune",
    author: "Frank Herbert",
    price: 19.99
  },
  {
    isbn: "978-0-143-03943-3",
    title: "The Grapes of Wrath",
    author: "John Steinbeck",
    price: 17.50
  },
  {
    isbn: "978-0-062-31609-6",
    title: "The Martian",
    author: "Andy Weir",
    price: 14.99
  }
];





// Sample cart
// const sampleCart = {
//   userId: "user001",
//   books: [
//     {
//       isbn: "978-0-7432-7356-5",
//       title: "The Great Gatsby",
//       author: "F. Scott Fitzgerald",
//     },
//     {
//       isbn: "978-0-061-96436-7",
//       title: "To Kill a Mockingbird",
//       author: "Harper Lee",
//     },
//   ],
// };

// Insert samples
// (uncomment to use them)
// db.users.insertOne(sampleUser);
// db.books.insertOne(sampleBook);
// db.carts.insertOne(sampleCart);


//if you want to drop after editing script
// db.tablename.drop()
//then rerun the setup script


for (var book of bookList){
  db.books.insertOne(book)
}
