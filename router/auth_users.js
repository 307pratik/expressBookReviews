const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "john123", password: "pass123" },
  { username: "alice", password: "alicepass" }
];
const SECRET = "12345"; 



const isValid = (username) => {
  return typeof username === "string" && username.trim().length > 0;
};

// returns boolean - checks username & password match a registered user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // input validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  // authenticate user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // create JWT and save to session
  const accessToken = jwt.sign({ username }, SECRET, { expiresIn: "1h" });

  if (!req.session) req.session = {};
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in", accessToken });
});

// Add a book review
// Add or update an authenticated user's review for a book
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // per hint: review comes from request query

  // Check authentication (username saved in session during login)
  if (!req.session || !req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "Unauthorized: please login first" });
  }
  const username = req.session.authorization.username;

  // Validate presence of review text
  if (!reviewText || reviewText.trim().length === 0) {
    return res.status(400).json({ message: "Please provide a review in the query, e.g. ?review=Nice+book" });
  }

  // Check book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews object exists
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update the user's review
  const isUpdate = Boolean(book.reviews[username]);
  book.reviews[username] = reviewText;

  // Return success and the updated set of reviews
  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    reviews: book.reviews
  });
});

// Delete a user's review for a book
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check authentication
  if (!req.session || !req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "Unauthorized: please login first" });
  }

  const username = req.session.authorization.username;

  // Check if book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if review exists for this user
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "You have no review for this book to delete" });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
