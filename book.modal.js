const mongoose = require('mongoose');

const books = new mongoose.Schema({
    title: String,
    author: String,
    bookCoverPath: String,
})

module.exports = mongoose.model('Book', books)