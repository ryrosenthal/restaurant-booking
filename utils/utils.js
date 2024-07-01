const padZero = (value) => {
    return (value < 10) ? `0${value}` : value
}

const formatDate = (date) => {
    const month = padZero(date.getMonth() + 1)
    const day = padZero(date.getDate())
    const hours = padZero(date.getHours())
    const minutes = padZero(date.getMinutes())
    const seconds = padZero(date.getSeconds())
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getArrayBindParams = (paramsArray) => {
    const length = paramsArray.length
    let paramsString = ''
    for (let i = 0; i < length; i++) {
        const val = (i === length - 1) ? "?" : "?,"
        paramsString += val
    }
    return paramsString
}

const getLikeBindParams = (paramsArray, columnName, operator, includeWhere = false) => {
    const length = paramsArray.length
    let paramsString = length > 0 && includeWhere ? 'WHERE ' : ''
    for (let i = 0; i < length; i++) {
        if (i !== 0) {
            paramsString += ` ${operator} `
        }
        paramsString += `${columnName} LIKE '%' || ? || '%'`
    }
    return paramsString
}

const addBracketsToArrayValues = (paramsArray) => {
    let newArr = []
    paramsArray.forEach((param) => {
        newArr.push(`[${param}]`)
    })
    return newArr
}

const getReservationBlockTimes = (reservationTime) => {
    const startTime = new Date(reservationTime)
    const endTime = new Date(reservationTime)

    startTime.setHours(startTime.getHours() - 2)
    endTime.setHours(endTime.getHours() + 2)

    return { 
        blockStartTime: formatDate(startTime), 
        blockEndTime: formatDate(endTime)
    }
}

module.exports = { 
    formatDate,
    getArrayBindParams, 
    getLikeBindParams, 
    addBracketsToArrayValues,
    getReservationBlockTimes,
}
