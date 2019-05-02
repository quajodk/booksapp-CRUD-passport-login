const express = require('express')
const router = express.Router()
const {
    ensureAuthenticated
} = require('../config/auth')

const Books = require('../models/books')

// Home Page - view all books
router.get('/', (req, res) => {
    // search for book with either title or genre
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        Books.find({
            $or: [{
                title: regex
            }, {
                genre: regex
            }]
        }).then(books => {
            if (books.length < 1) {
                req.flash('error_msg', 'No book(s) was found for your search..')
                res.redirect('/')
            } else {
                res.render('home', {
                    page: 'Home',
                    user: req.user,
                    books: books
                })
            }
        }).catch(err => console.log(err))
    } else {
        Books.find().then(books => {
            res.render('home', {
                page: 'Home',
                user: req.user,
                books: books
            })
        }).catch(err => console.log(err))
    }
})

// Adding Books Page
router.get('/create', ensureAuthenticated, (req, res) => {
    res.render('books/create', {
        page: 'Create Book',
        user: req.user
    })
})

// Adding Books Handle
router.post('/create', (req, res) => {
    const {
        title,
        author,
        genre,
        description
    } = req.body

    let error = []

    // check for required fields
    if (!title) {
        error.push({
            msg: 'Please enter the title of the book'
        })
    }

    if (!author) {
        error.push({
            msg: 'Please enter the author of the book'
        })
    }

    if (!genre) {
        error.push({
            msg: 'Please enter the genre of the book'
        })
    }

    // check for error
    if (error.length > 0) {
        res.render('books/create', {
            error,
            title,
            author,
            genre,
            description,
            user: req.user,
            page: 'Create Book'
        })
    } else {
        // check if title already exist
        Books.findOne({
                title: title
            })
            .then(book => {
                if (book) {
                    errors.push({
                        msg: 'Please book already exist.. update or change/add Eg(pt1, Review, 1, 2) to the title'
                    })
                    res.render('books/create', {
                        errors,
                        title,
                        author,
                        genre,
                        description,
                        user: req.user,
                        page: 'Create Book'
                    })
                } else {
                    const newBook = new Books({
                        title,
                        author,
                        genre,
                        description
                    })
                    // save new book
                    newBook.save().then(book => {
                        req.flash('success_msg', 'Book has been added successfully')
                        res.redirect('/')
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            })
    }
})

// View Book
router.get('/:id', ensureAuthenticated, (req, res) => {
    Books.findById(req.params.id).then(book => {
        res.render('books/view', {
            page: 'View Book',
            user: req.user,
            book: book
        })
    }).catch(err => console.log(err))
})

// Update/Edit book
router.get('/update/:id', ensureAuthenticated, (req, res) => {
    Books.findById(req.params.id).then(book => {
        res.render('books/update', {
            page: 'Edit Book',
            user: req.user,
            book: book
        })
    }).catch(err => console.log(err))
})

// Update Handle
router.post('/update', (req, res) => {
    const {
        _id,
        title,
        author,
        genre,
        description
    } = req.body

    let error = []

    // check for required fields
    if (!title) {
        error.push({
            msg: 'Please enter the title of the book'
        })
    }

    if (!author) {
        error.push({
            msg: 'Please enter the author of the book'
        })
    }

    if (!genre) {
        error.push({
            msg: 'Please enter the genre of the book'
        })
    }

    // check for error
    if (error.length > 0) {
        res.render('/books/create', {
            error,
            user: req.user,
            book: req.body,
            page: 'Create Book'
        })
    } else {
        updateBook(req, res)
    }
})

// updating book
function updateBook(req, res) {
    Books.findOneAndUpdate({
        _id: req.body._id
    }, req.body, {
        new: true
    }).then(book => {
        req.flash('success_msg', 'Book was successfully updated')
        res.redirect('/')
    }).catch(err => console.log(err))
}

// Delete Book
router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    Books.findByIdAndRemove(req.params.id).then(book => {
        req.flash('success_msg', 'Book was successfully deleted')
        res.redirect('/')
    }).catch(err => console.log(err))
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

module.exports = router