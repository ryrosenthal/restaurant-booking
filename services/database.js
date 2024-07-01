const sqlite3 = require('sqlite3').verbose()

const { getArrayBindParams, getLikeBindParams, addBracketsToArrayValues } = require('../utils/utils')

const db = new sqlite3.Database('./db/test.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message)
    }
    console.log('Connected to the database')
})

const queryDinerRestrictions = (dinerIds, callback) => {
    const sql = `SELECT Dietary_Restrictions FROM Diners where ID IN (${getArrayBindParams(dinerIds)})`
    db.all(sql, dinerIds, callback)
}

const queryRestaurantEndorsements = (dinerRestrictions, callback) => {
    const sql = `SELECT * FROM Restaurants ${getLikeBindParams(dinerRestrictions, "Endorsements", "AND", true)}`
    db.all(sql, dinerRestrictions, callback)
}

const queryAvailableTables = (capacity, restaurantIds, startTime, endTime, callback) => {
    const sql = `SELECT * FROM Tables WHERE Capacity >= ? 
            AND Restaurant_ID IN (${getArrayBindParams(restaurantIds)}) 
            AND Table_ID NOT IN
            (SELECT Table_ID FROM Reservations WHERE time BETWEEN ? AND ?)`

    const params = [capacity, ...restaurantIds, startTime, endTime]
    db.all(sql, params, callback)
}

const queryDinerReservations = (dinerIds, startTime, endTime, callback) => {
    const likeBindParams = getLikeBindParams(dinerIds, "Diner_IDs", "OR")
    const formattedDinerIds = addBracketsToArrayValues(dinerIds)

    const sql = `SELECT Table_ID FROM Reservations WHERE time BETWEEN ? AND ? AND ${likeBindParams}`
    const params = [startTime, endTime, ...formattedDinerIds]
    db.get(sql, params, callback)
}

const insertReservation = (tableId, restaurantId, dinerIds, reservationTime, callback) => {
    const formattedDinerIds = addBracketsToArrayValues(dinerIds).toString()
    
    const sql = "INSERT INTO Reservations (Table_ID, Restaurant_ID, Time, Diner_IDs) VALUES (?, ?, ?, ?)"
    const params = [tableId, restaurantId, reservationTime, formattedDinerIds]
    db.run(sql, params, function(err) {
        return callback(err, this.lastID)
    })
}

const deleteReservation = (reservationId, callback) => {
    const sql = "DELETE FROM Reservations WHERE Reservation_ID = ?"
    db.run(sql, [reservationId], function(err) {
        const hasChanges = Boolean(this.changes)
        return callback(err, hasChanges)
    })
}

module.exports = { 
    queryDinerRestrictions, 
    queryRestaurantEndorsements, 
    queryAvailableTables, 
    queryDinerReservations, 
    insertReservation,
    deleteReservation
}
