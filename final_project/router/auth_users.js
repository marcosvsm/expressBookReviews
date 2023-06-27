const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const filteredUser = users.find(user => user.username === username);
  if(filteredUser)
    return true;
  return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const filteredUser = users.find(user => user.username === username && user.password === password);
  if(filteredUser)
    return true;
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(404).json({message: "Username or password missing"});
  }
  if(isValid(username)){
    if(authenticatedUser(username,password)){
      let accessToken = jwt.sign({
        data:password
      }, 'access', { expiresIn: 60*60 });
      req.session.authorization = {accessToken,username};
      return res.status(200).send("User successfully logged in");
    }else{
      return res.status(401).json({ message: "Invalid username or password" });
    }
  }else{
    return res.status(403).json({message: "Username is not valid"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const {reviews} = req.body;
  const user = req.session.authorization.username;
  if(book){
    book.reviews[user] = reviews;
    books[isbn].reviews = book.reviews;
    return res.status(200).json({message:"Review successfully posted"});
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req,res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const user = req.session.authorization.username;
  if(book){
    if(books[isbn].reviews[user]){
      delete books[isbn].reviews[user];
      return res.json({ message: `Review successfully deleted.` })
    }
    return res.json({message: 'Review by '+user+' could not be found'})
  }
  return res.status(403).json({ message: `Book with ISBN '${isbn}' could not be found.` })
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
