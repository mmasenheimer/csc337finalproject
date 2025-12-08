// services/book.js
// Handles all book-related database operations

// Get all books
async function getAllBooks(db) {
  return await db.collection("books").find({}).toArray();
}

// Get book by ISBN
async function getBookByISBN(db, isbn) {
  return await db.collection("books").findOne({ isbn: isbn });
}

// Add a new book (ADMIN)
async function addBook(db, bookData) {
  const { isbn, title, author, price, imageUrl } = bookData;

  // Check if book already exists
  const existing = await getBookByISBN(db, isbn);
  if (existing) {
    throw new Error("Book with this ISBN already exists");
  }

  const book = {
    isbn,
    title,
    author,
    price: parseFloat(price),
    imageUrl: imageUrl
  };
  

  await db.collection("books").insertOne(book);
  return book;
}

// Update an existing book (ADMIN)
async function updateBook(db, isbn, updateData) {
  const { title, author, price, imageUrl } = updateData;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;
  if (
    updateData.price !== undefined &&
    updateData.price !== "" &&
    !isNaN(updateData.price)
  ) {
    updates.price = parseFloat(updateData.price);
  }
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;

  const result = await db
    .collection("books")
    .updateOne({ isbn: isbn }, { $set: updates });

  if (result.matchedCount === 0) {
    throw new Error("Book not found");
  }

  return await getBookByISBN(db, isbn);
}

// Delete a book (ADMIN)
async function deleteBook(db, isbn) {
  const result = await db.collection("books").deleteOne({ isbn: isbn });

  if (result.deletedCount === 0) {
    throw new Error("Book not found");
  }

  // Remove this book from all carts
  await db
    .collection("carts")
    .updateMany({}, { $pull: { books: { isbn: isbn } } });

  return { success: true, message: "Book deleted successfully" };
}

module.exports = {
  getAllBooks,
  getBookByISBN,
  addBook,
  updateBook,
  deleteBook,
};
