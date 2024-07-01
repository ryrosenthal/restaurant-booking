const { 
    queryDinerRestrictions, 
    queryRestaurantEndorsements, 
    queryAvailableTables, 
    queryDinerReservations, 
    insertReservation, 
    deleteReservation
} = require('./database')

const getDinerRestrictions = (dinerIds) => {
    return new Promise((resolve, reject) => {
        queryDinerRestrictions(dinerIds, (err, rows) => {
            if (err) return reject(err)

            const totalRestrictions = []
            rows.forEach((row) => {
                const rowRestrictions = row.Dietary_Restrictions
                if (!rowRestrictions) return

                const rowRestrictionsArray = rowRestrictions.split(', ')
                rowRestrictionsArray.forEach((restriction) => {
                    if (!totalRestrictions.includes(restriction)) {
                        totalRestrictions.push(restriction)
                    }
                })
            })
            return resolve(totalRestrictions)
        })
    })
}

const getEndorsedRestaurantsMap = (dinerRestrictions) => { 
    return new Promise((resolve, reject) => {
        queryRestaurantEndorsements(dinerRestrictions, (err, rows) => {
            if (err) return reject(err)

            const restaurantMap = new Map()
            rows.forEach((row) => {
                restaurantMap.set(row.ID, {Id: row.ID, Name: row.Name})
            })
            return resolve(restaurantMap)
        })
    })
}

const getAvailableRestaurantsMap = (capacity, endorsedRestaurantsMap, startTime, endTime) => {
    return new Promise((resolve, reject) => {
        const restaurantIds = Array.from(endorsedRestaurantsMap.keys())
        queryAvailableTables(capacity, restaurantIds, startTime, endTime, (err, rows) => {
            if (err) return reject(err)
            
            const availableRestaurantsMap = new Map()
            rows.forEach((row) => {
                const restaurantId = row.Restaurant_ID
                const tableId = row.Table_ID

                if (!availableRestaurantsMap.has(restaurantId)) {
                    const restaurantName = endorsedRestaurantsMap.get(restaurantId).Name
                    availableRestaurantsMap.set(restaurantId, {Id: restaurantId, Name: restaurantName, TableId: tableId})
                }
            })
            return resolve(availableRestaurantsMap)
        })
    })
}

const getAvailableRestaurants = async (dinerIds, startTime, endTime) => {
    const dinerRestrictions = await getDinerRestrictions(dinerIds)
    const endorsedRestaurantsMap = await getEndorsedRestaurantsMap(dinerRestrictions)
    const availableRestaurantsMap = await getAvailableRestaurantsMap(dinerIds.length, endorsedRestaurantsMap, startTime, endTime)

    return Array.from(availableRestaurantsMap.values())
}

const hasConflictingReservations = (dinerIds, startTime, endTime) => {
    return new Promise((resolve, reject) => {
        queryDinerReservations(dinerIds, startTime, endTime, (err, row) => {
            if (err) return reject(err)

            return row ? resolve(true) : resolve(false)
        })
    })
}

const createGroupReservation = (tableId, restaurantId, reservationTime, dinerIdsString) => {
    const dinerIds = dinerIdsString.split(",")
    return new Promise((resolve, reject) => {
        insertReservation(tableId, restaurantId, dinerIds, reservationTime, (err, reservationId) => {
            if (err) return reject(err)

            return resolve({ 
                reservationId,
                restaurantId,
                tableId,
                dinerIds,
                reservationTime
            })
        })
    })
}

const cancelReservation = (reservationId) => {
    return new Promise((resolve, reject) => {
        deleteReservation(reservationId, (err, hasChanges) => {
            if (err) return reject(err)

            return hasChanges ? resolve(true) : resolve(false)
        })
    })
}

module.exports = { 
    getAvailableRestaurants, 
    hasConflictingReservations, 
    createGroupReservation, 
    cancelReservation,
}
