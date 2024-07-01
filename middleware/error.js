const errorHandler = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).json({message: err})
    } else {
        console.log('err', err)
        res.status(500).json({message: err})
    }
}

module.exports = { errorHandler }
