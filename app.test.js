const request = require('supertest')
const { getAvailableRestaurants, hasConflictingReservations, cancelReservation, createGroupReservation } = require('./services/service')
const app = require('./app')

jest.mock('./services/service')

describe('GET /restaurants', () => {
    describe('given dinerIds and reservationTime', () => {

        // Mock the implementation of the getAvailableRestaurants function
        getAvailableRestaurants
            // For the first test, return two restaurants
            .mockImplementationOnce(() => {
                return new Promise((resolve) => resolve([
                    {
                        Id: "1",
                        Name: "Restaurant A",
                        TableId: "1"
                    },
                    {
                        Id: "2",
                        Name: "Restaurant B",
                        TableId: "2"
                    }
                ]))
            })
            // For the other tests, return empty array (no available restaurants)
            .mockImplementation(() => {
                return new Promise((resolve) => resolve([]))
            })

        // Mock the return value of the hasConflictingReservations call
        hasConflictingReservations
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true) // Show the error case in the third test

        test('response has a restaurantId, restaurantName, and tabledId when a table is available', async () => {
            const response = await request(app).get('/api/restaurants?dinerIds=5&reservationTime=2024-07-21T01:00:00').send()
            expect(response.statusCode).toEqual(200)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            
            const body = response.body
            const firstRestaurant = body[0]
            expect(firstRestaurant.Id).toEqual("1")
            expect(firstRestaurant.Name).toEqual("Restaurant A")
            expect(firstRestaurant.TableId).toEqual("1")
            const secondRestaurant = body[1]
            expect(secondRestaurant.Id).toEqual("2")
            expect(secondRestaurant.Name).toEqual("Restaurant B")
            expect(secondRestaurant.TableId).toEqual("2")

        })
        test('response is empty when no tables are available', async () => {
            const response = await request(app).get('/api/restaurants?dinerIds=4&reservationTime=2024-07-21T01:00:00').send()
            expect(response.statusCode).toEqual(200)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body).toEqual([])
        })
        test('should respond with error when diner has existing reservation within window', async () => {
            const response = await request(app).get('/api/restaurants?dinerIds=1,2,3&reservationTime=2024-07-21T01:00:00').send()
            expect(response.statusCode).toEqual(422)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('Diner has existing reservation within the requested reservation window')
        })
    })

    describe('when dinerIds and reservationTime are missing', () => {
        test('should respond with error when dinerIds is missing', async () => {
            const response = await request(app).get('/api/restaurants?&reservationTime=2024-07-21T01:00:00').send()
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('query.dinerIds is a required field')
        })
        test('should respond with error when reservationTime is missing', async () => {
            const response = await request(app).get('/api/restaurants?dinerIds=1,2,3').send()
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('query.reservationTime is a required field')
        })
    })

    describe('when dinerIds and reservationTime are invalid', () => {
        test('should respond with error when dinerIds is invalid', async () => {
            const response = await request(app).get('/api/restaurants?dinerIds=TEST&reservationTime=2024-07-21T01:00:00').send()
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('query.dinerIds must match the following: \"/^[0-9]+(,[0-9]+)*$/\"')
        })
        test('should respond with error when reservationTime is invalid', async () => {
            const response = await request(app).get('/api/restaurants?dinerIds=1,2,3&reservationTime=TEST').send()
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('query.reservationTime must be a `date` type, but the final value was: `Invalid Date` (cast from the value `\"TEST\"`).')
        })
    })
})

describe('POST /restaurants/reservation', () => {
    describe('given tableId, restaurantId, dinerIds, and reservationTime', () => {
       
        // Mock the return value for creating the reservation
        createGroupReservation.mockImplementation(() => {
            return new Promise((resolve) => resolve({ 
                reservationId:'1234',
                restaurantId: '1',
                tableId: '1',
                dinerIds: ['1','2','3'],
                reservationTime: '2020-01-21T01:00:00'
            }))
        })

        test('response has a reservationId, restaurantId, tabledId and reservationTime when reservation is created', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                restaurantId: '1',
                dinerIds: '1,2,3',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(201)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            
            const body = response.body
            expect(body.reservationId).toEqual("1234")
            expect(body.restaurantId).toEqual("1")
            expect(body.tableId).toEqual("1")
            expect(body.dinerIds).toEqual(["1","2","3"])
            expect(body.reservationTime).toEqual('2020-01-21T01:00:00')
        })
    })

    describe('when params are missing', () => {
        test('should respond with error when tableId is missing', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                restaurantId: '1',
                dinerIds: '5',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('body.tableId is a required field')
        })
        test('should respond with error when restaurantId is missing', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                dinerIds: '5',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('body.restaurantId is a required field')
        })
        test('should respond with error when dinerIds is missing', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                restaurantId: '1',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('body.dinerIds is a required field')
        })
        test('should respond with error when reservationTime is missing', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                restaurantId: '1',
                dinerIds: '5'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('body.reservationTime is a required field')
        })
    })

    describe('when params are invalid', () => {
        test('should respond with error when tableId is invalid', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: "TEST",
                restaurantId: '1',
                dinerIds: '5',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual("body.tableId must be a `number` type, but the final value was: `NaN` (cast from the value `\"TEST\"`).")
        })
        test('should respond with error when restaurantId is invalid', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                restaurantId: "TEST",
                dinerIds: '5',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual("body.restaurantId must be a `number` type, but the final value was: `NaN` (cast from the value `\"TEST\"`).")
        })
        test('should respond with error when dinerIds is invalid', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                restaurantId: '1',
                dinerIds: 'TEST',
                reservationTime: '2020-01-21T01:00:00'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual("body.dinerIds must match the following: \"/^[0-9]+(,[0-9]+)*$/\"")
        })
        test('should respond with error when reservationTime is invalid', async () => {
            const response = await request(app).post('/api/restaurants/reservation').send({
                tableId: '1',
                restaurantId: '1',
                dinerIds: '5',
                reservationTime: 'TEST',
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('body.reservationTime must be a `date` type, but the final value was: `Invalid Date` (cast from the value `\"TEST\"`).')
        })
    })
})

describe('DELETE /restaurants/reservation', () => {

    describe('given reservationId', () => {

        // Mock the return value for cancelReservation
        cancelReservation
            // Return true for the first test
            .mockImplementationOnce(() => {
                return new Promise((resolve) => resolve(true))
            })
            // Return false for the second test, so we can see the error case
            .mockImplementationOnce(() => {
                return new Promise((resolve) => resolve(false))
            })

        test('should respond with 201 when reservation is deleted', async () => {
            const response = await request(app).delete('/api/restaurants/reservation').send({
                reservationId: '1'
            })
            expect(cancelReservation).toHaveBeenCalledTimes(1)
            expect(cancelReservation).toHaveBeenCalledWith("1")
            expect(response.statusCode).toEqual(204, '')
        })

        test('should respond with error if reservationId does not exist', async () => {
            const response = await request(app).delete('/api/restaurants/reservation').send({
                reservationId: '10000'
            })
            expect(response.statusCode).toEqual(404)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual("reservationId does not exist")
        })
    })

    describe('when reservationId is missing', () => {
        test('should respond with error when reservationId is missing', async () => {
            const response = await request(app).delete('/api/restaurants/reservation').send()
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual('body.reservationId is a required field')
        })
    })

    describe('when reservationId is invalid', () => {
        test('should respond with error when reservationId is invalid', async () => {
            const response = await request(app).delete('/api/restaurants/reservation').send({
                reservationId: "TEST"
            })
            expect(response.statusCode).toEqual(400)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
            expect(response.body.message).toEqual("body.reservationId must be a `number` type, but the final value was: `NaN` (cast from the value `\"TEST\"`).")
        })
    })
})
