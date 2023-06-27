const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(password === '' || username === '')
    return res.status(200).json({message: "Username or password were not provided"});
  const filteredUser = users.find(user => user.username === username);
  if(filteredUser)
    return  res.status(200).json({message: "Username "+filteredUser.username+" already exist"});
  const user = {username,password};
  users.push(user);
  return res.status(200).json({message: "Registred username "+user.username});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try{
    res.status(200).json(books);
  } catch (error) {
    res.status(404).json({message: "Books not found"})
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const getPromise = new Promise((resolve,reject) => {
    const isbn = req.params.isbn;
    let book = books[isbn];
    if(book)
      resolve(res.status(200).json(book));
    else
      reject(res.status(404).json({message: "Book not found by ISBN: "+isbn}));
    
  });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const getPromise = new Promise((resolve,reject) =>{
    let author = req.params.author.toLowerCase();
    if(author.includes('-'))
    author = author.replace(/-/g, ' ');
    const bookKeys = Object.keys(books);
    let bookByAuthor = {};
    let index = 1;
    for (let i=0; i< bookKeys.length;i++){
      const bookNumber = bookKeys[i];
      const book = books[bookNumber];
      if(book.author.toLowerCase() == author){
        bookByAuthor[index] = book;
        index++;
      }
    }
    if(bookByAuthor)
      resolve(res.status(200).json(bookByAuthor));
    else
      reject(res.status(404).json({message: "Book not found by Author: "+author}));

  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const getPromise = new Promise((resolve,reject) => {
    let title = req.params.title;
    if(title.includes('-'))
    title = title.replace(/-/g, ' ');
    const bookKeys = Object.keys(books);
    let bookByTitle = {};
    let index = 1;
    for (let i=0; i<bookKeys.length;i++){
      const bookNumber = bookKeys[i];
      const book = books[bookNumber];
      if(book.title == title){
        bookByTitle[index] = book;
        index++;
      }
    }
    if(bookByTitle)
      resolve(res.status(200).json({bookByTitle}));
    else
      reject(res.status(300).json({message: "Book not found by Title: "+title}));

  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book)
    return res.status(200).json(book.reviews);
  else
    return res.status(404).json({message: "Book not found by ISBN"});
});

module.exports.general = public_users;
