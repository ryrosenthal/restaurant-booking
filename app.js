const express = require('express')

const { errorHandler } = require('./middleware/error')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const restaurantsRouter = require('./routes/restaurants')
app.use('/api/restaurants', restaurantsRouter)

app.use(errorHandler)

module.exports = app
