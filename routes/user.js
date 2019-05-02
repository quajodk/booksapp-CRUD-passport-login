const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = require('../models/user')

// Login Page
router.get('/login', (req, res) => {
    res.render('login', {
        page: 'Login'
    })
})

// Register Page
router.get('/register', (req, res) => {
    res.render('register', {
        page: 'Register'
    })
})

// Register Handler
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        password2
    } = req.body
    let error = []

    // Check for required fields
    if (!name || !email || !password || !password2) {
        error.push({
            msg: 'Please fill in your details'
        })
    }

    // Check password match
    if (password !== password2) {
        error.push({
            msg: 'Passwords do not match'
        })
    }

    // Check password
    if (password.length < 6) {
        error.push({
            msg: 'Password should be at least 6 characters'
        })
    }

    // Check for errors
    if (error.length > 0) {
        res.render('register', {
            error,
            name,
            email,
            password,
            password2,
            page: 'Register'
        })
    } else {
        // Validate user
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    error.push({
                        msg: 'Email is already registered...'
                    })
                    // if user exist render the register
                    res.render('register', {
                        error,
                        name,
                        email,
                        password,
                        password2,
                        page: 'Register'
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })

                    // hash password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err
                            // set password to the hashed password
                            newUser.password = hash
                            // save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You\'re now registered... Login..')
                                    res.redirect('/user/login')
                                })
                                .catch(err => console.log(err))
                        }))
                }
            })
    }
})


// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next)
})


// Logout Handle
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You\'re logged out')
    res.redirect('/user/login')
})
module.exports = router