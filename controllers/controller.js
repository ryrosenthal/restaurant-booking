const { getAvailableRestaurants, hasConflictingReservations, createGroupReservation, cancelReservation } = require('../services/service')
const { getReservationBlockTimes } = require('../utils/utils')

const getRestaurants = async (req, res) => {
    const dinerIds = req.query.dinerIds.split(',')
    const { blockStartTime, blockEndTime } = getReservationBlockTimes(req.query.reservationTime)

    const hasConflicts = await hasConflictingReservations(dinerIds, blockStartTime, blockEndTime)
    if (hasConflicts) {
        return res.status(422).json({message: "Diner has existing reservation within the requested reservation window"})
    }

    const availableRestaurants = await getAvailableRestaurants(dinerIds, blockStartTime, blockEndTime)
    res.status(200).json(availableRestaurants)
}

const createReservation = async (req, res) => {
    const { tableId, restaurantId, dinerIds, reservationTime } = req.body

    const createdReservation = await createGroupReservation(tableId, restaurantId, reservationTime, dinerIds)
    return res.status(201).json(createdReservation)
}

const deleteReservation = async (req, res) => {
    const cancelledReservation = await cancelReservation(req.body.reservationId)
    
    if (!cancelledReservation) {
        return res.status(404).json({message: "reservationId does not exist"})
    }
    return res.status(204).send()
}

module.exports = { getRestaurants, createReservation, deleteReservation }
