const express = require('express')
const router = express.Router()

const { validate, restaurantsSchema, reservationCreateSchema, reservationDeleteSchema } = require('../middleware/validate')
const { getRestaurants, createReservation, deleteReservation } = require('../controllers/controller')

// @desc    Get list of restaurants
// @route   GET /api/restaurants
// @params  dinerIds, reservationTime
router.get('/', validate(restaurantsSchema), getRestaurants)

router
    .route('/reservation')
        // @desc    Create reservation 
        // @route   POST /api/restauarants/reservation
        // @params  tableId, restaurantId, dinerIds, reservationTime
        .post(validate(reservationCreateSchema), createReservation)
        // @desc    Delete existing reservation
        // @route   DELETE /api/restaurants/reservation
        // @params  reservationId
        .delete(validate(reservationDeleteSchema), deleteReservation)

module.exports = router
