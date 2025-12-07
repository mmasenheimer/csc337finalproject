// Book.js file - this houses all book endpoints

// Get all books -- GET ALL endpoint
async function getAllBooks(db) {
  return await db.collection("books").find({}).toArray();
}

// Get book by ISBN number -- FIND ONE endpoint
async function getBookByISBN(db, isbn) {
  return await db.collection("books").findOne({ isbn: isbn });
}

// Add a book to the cart
async function addToCart(db, userId, bookData) {
  const { isbn, quantity = 1 } = bookData;

  const book = await getBookByISBN(db, isbn);

  // Make sure the book requested actually exists
  if (!book) {
    throw new Error("Book not found");
  }

  const cart = await getUserCart(db, userId);

  // Check if the book is already in the cart, update quantity as needed
  const existingBookIndex = cart.books.findIndex((b) => b.isbn === isbn);

  if (existingBookIndex !== -1) {
    // Update the quantity of that book
    cart.books[existingBookIndex].quantity += quantity;
  } else {
    // Add the new book to the cart
    cart.books.push({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: quantity,
    });
  }

  await db
    .collection("carts")
    .updateOne({ userId: parseInt(userId) }, { $set: { books: cart.books } });

  return cart;
}

// ADMIN PROPERTY: Add new book
async function addBook(db, bookData) {
  const { isbn, title, author, price } = bookData;

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
  };

  await db.collection("books").insertOne(book);
  return book;
}

// ADMIN PROPERTY: Update book
async function updateBook(db, isbn, updateData) {
  const { title, author, price } = updateData;

  const updates = {};
  if (title) updates.title = title;
  if (author) updates.author = author;
  if (price !== undefined) updates.price = parseFloat(price);

  const result = await db
    .collection("books")
    .updateOne({ isbn: isbn }, { $set: updates });

  if (result.matchedCount === 0) {
    throw new Error("Book not found");
  }

  return await getBookByISBN(db, isbn);
}

// ADMIN PROPERTY: Delete book
async function deleteBook(db, isbn) {
  const result = await db.collection("books").deleteOne({ isbn: isbn });

  if (result.deletedCount === 0) {
    throw new Error("Book not found");
  }

  // Also remove from all carts
  await db
    .collection("carts")
    .updateMany({}, { $pull: { books: { isbn: isbn } } });

  return { success: true, message: "Book deleted successfully" };
}

module.exports = {
  getAllBooks,
  getBookByISBN,
  addToCart,
  addBook,
  updateBook,
  deleteBook,
};
