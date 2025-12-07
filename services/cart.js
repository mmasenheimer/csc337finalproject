// carts.js file - This file houses cart management endpoints

const { getBookByISBN } = require("./book");

// Get the user's cart
async function getUserCart(db, userId) {
  const numericId = parseInt(userId);

  let cart = await db.collection("carts").findOne({ userId: numericId });

  // If the cart doesn't exist upon function call, create an empty new one
  if (!cart) {
    cart = {
      userId: numericId,
      books: [],
    };
    await db.collection("carts").insertOne(cart);
  }

  return cart;
}

// Add a book to the cart
async function addToCart(db, userId, bookData) {
  const numericId = parseInt(userId);
  const { isbn, quantity = 1, imageUrl } = bookData;

  // Look up the book in the books collection
  const book = await getBookByISBN(db, isbn);

  // Make sure the book requested actually exists
  if (!book) {
    throw new Error("Book not found");
  }

  const cart = await getUserCart(db, numericId);

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
      imageUrl: book.imageUrl || imageUrl || null,
      quantity: quantity,
    });
  }

  await db
    .collection("carts")
    .updateOne({ userId: numericId }, { $set: { books: cart.books } });

  return cart;
}

// Update book quantity in cart
async function updateCartItemQuantity(db, userId, isbn, quantity) {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const result = await db
    .collection("carts")
    .updateOne(
      { userId: parseInt(userId), "books.isbn": isbn },
      { $set: { "books.$.quantity": quantity } }
    );

  if (result.matchedCount === 0) {
    throw new Error("Book not found in cart");
  }

  return await getUserCart(db, userId);
}

// Remove book from cart
async function removeFromCart(db, userId, isbn) {
  const result = await db
    .collection("carts")
    .updateOne(
      { userId: parseInt(userId) },
      { $pull: { books: { isbn: isbn } } }
    );

  if (result.matchedCount === 0) {
    throw new Error("Cart not found");
  }

  return await getUserCart(db, userId);
}

// Clear entire cart
async function clearCart(db, userId) {
  await db
    .collection("carts")
    .updateOne({ userId: parseInt(userId) }, { $set: { books: [] } });

  return { userId: parseInt(userId), books: [] };
}

// Calculate cart total
async function getCartTotal(db, userId) {
  const cart = await getUserCart(db, userId);

  const total = cart.books.reduce((sum, book) => {
    const price = Number(book.price) || 0;
    const qty = Number(book.quantity) || 0;
    return sum + price * qty;
  }, 0);

  return {
    subtotal: total,
    total: total,
    itemCount: cart.books.reduce(
      (sum, book) => sum + (Number(book.quantity) || 0),
      0
    ),
  };
}

module.exports = {
  getUserCart,
  updateCartItemQuantity,
  removeFromCart,
  addToCart,
  clearCart,
  getCartTotal,
};
