const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

const app = express()

// Passport config
require('./config/passport')(passport)

// DB Config
const db = require('./config/db').mongoURI

// Connect to db
mongoose.connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

// EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Body-parser
app.use(express.urlencoded({
    extended: false
}))

// Express Session
app.use(session({
    secret: 'secure',
    resave: true,
    saveUninitialized: true
}))

// Passport Auth
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

// Public folder
app.use(express.static(__dirname + '/public'))

// Routes
app.use('/', require('./routes/index'))
app.use('/user', require('./routes/user'))


// create port
const PORT = process.env.PORT || 5000


app.listen(PORT, console.log(`Serve started on port ${PORT}`))