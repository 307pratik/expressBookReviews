const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    const userExists = users.find(user => user.username === username);
  
    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    // Register new user
    users.push({ username, password });
  
    return res.status(200).json({ message: "User successfully registered" });
  });
  

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const getBooks = () => {
        return new Promise((resolve) => {
          resolve(JSON.stringify(books, null, 4));
        });
      };
  
      const result = await getBooks();
      return res.status(200).send(result);
  
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
  
    try {
      const fetchBook = () => {
        return new Promise((resolve, reject) => {
          const book = books[isbn];
          if (book) {
            resolve(JSON.stringify(book, null, 4));
          } else {
            reject("Book not found");
          }
        });
      };
  
      const result = await fetchBook();
      return res.status(200).send(result);
  
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });
  
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
  
    try {
      const findBooksByAuthor = () => {
        return new Promise((resolve, reject) => {
          const matchingBooks = [];
  
          for (let key in books) {
            if (books[key].author.toLowerCase() === author) {
              matchingBooks.push({ isbn: key, ...books[key] });
            }
          }
  
          if (matchingBooks.length > 0) {
            resolve(JSON.stringify(matchingBooks, null, 4));
          } else {
            reject("No books found for this author");
          }
        });
      };
  
      const result = await findBooksByAuthor();
      return res.status(200).send(result);
  
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });
  
// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
  
    try {
      const findBooksByTitle = () => {
        return new Promise((resolve, reject) => {
          const matchingBooks = [];
  
          for (let key in books) {
            if (books[key].title.toLowerCase() === title) {
              matchingBooks.push({ isbn: key, ...books[key] });
            }
          }
  
          if (matchingBooks.length > 0) {
            resolve(JSON.stringify(matchingBooks, null, 4));
          } else {
            reject("No books found with this title");
          }
        });
      };
      const result = await findBooksByTitle();
      return res.status(200).send(result);
  
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });
  

//  Get book review
// Get the book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;   // Retrieve ISBN from URL
    const book = books[isbn];       // Find the book by ISBN
  
    if (book) {
      return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  

module.exports.general = public_users;
