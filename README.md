# Restaurant Booking API with a social Twist

## Run API
1. Clone repo
2. Run "npm run start"

## Endpoints
- GET `/api/restaurants` - Returns list of restaruants with an available TableId for the given group and reservation time
  - Params:
    - `dinerIds` (example: "1,2,3")
    - `reservationTime` (example: "2024-07-21T02:00:00")
  - Example: http://localhost:5000/api/restaurants?dinerIds=5&reservationTime=2024-07-21_01:00:00
  - Response:
    - `[
    {
        "Id": 1,
        "Name": "Hudson Botanical",
        "TableId": 2
    },
    {
        "Id": 2,
        "Name": "Gracie's",
        "TableId": 3
    }
]`
- POST `/api/restaurants/reservation` - Creates a reservation for the given group, restaurant, tableId, and reservationTime
  - Params:
    - `tableId` (example: "1")
    - `restaurantId` (example: "1")
    - `dinerIds` (example: "1,2,3")
    - `reservationTime` (example: "2024-07-21T02:00:00")
  - Response: `{
    "reservationId": 92,
    "restaurantId": "1",
    "tableId": "1",
    "dinerIds": [
        "1",
        "2",
        "3"
    ],
    "reservationTime": "2024-07-21 01:00:00"
}`
- DELETE `/api/restaurants/reservation` - Deletes the reservation for a given `reservationId` (example: "10")

## Implementation Notes
- I used SQLite for the database. The database file is store at "db/test.db" can be used by installing DB Browser for SQLite (https://sqlitebrowser.org/)
  - Using SQLite ended up causing an issue because the sql expression for regex "REGEXP" is not supported by SQLite. I was able to implement a workaround using LIKE and storing the dinerIds between brackets like "[1],[2]"
  - I'd use something like Postgres for a production DB
- Used the beta version of Express for better error handling (specifically around promise rejections / db errors), but I wouldn't use that in production
- I chose to use JavaScript instead of TypeScript because it was my first time building APIs with node / express and I didn't want to spend time on the extra configuration step but I'd def use TypeScript instead in a production app! :)
- If I had more time I would've built out extra test cases to cover business logic and the database calls more in depth

## Database

### Current Data
![image](https://github.com/ryrosenthal/restaurant-booking/assets/19440071/5c5cc823-a6b1-41ad-936b-b6b23f77d07e)
![image](https://github.com/ryrosenthal/restaurant-booking/assets/19440071/5c17b0f4-e57b-40a9-bc9d-d4f12399d967)
![image](https://github.com/ryrosenthal/restaurant-booking/assets/19440071/7a20c96d-5803-4f00-af8c-c3d599715d1e)
![image](https://github.com/ryrosenthal/restaurant-booking/assets/19440071/33276b35-d990-4662-81fb-88346a981142)

<br/>

# Product requirements
We’re building the backend for an app that allows users to do the following: with a group of
friends, find a restaurant that fits the dietary restrictions of the whole group, with an available
table at a specific time, and then create a reservation for that group and time.

Our world has the following:
- Eaters
  - Name
  - Zero or more dietary restrictions (“Gluten Free”, “Vegetarian”, “Paleo”, etc.)
- Restaurants
  - Name
  - Zero or more endorsements (“Vegan-friendly”, “Gluten-Free-Friendly”,
“Paleo-friendly”)
- Tables
  - Capacity (e.g. Seats 4 people)
- Reservations
  - Table
  - Diners
  - Time

Assume that reservations last 2 hours. Users may not double-book or have overlapping
reservations. Eg. Jane may not have a reservation at McDonalds at 7pm and at Burger King at
7:30pm.

Build endpoints to do the following:
- An endpoint to find restaurants with an available table for a group of users at a specific
time.
  - Example: Scott, George and Elise are looking for a reservation at 7:30pm on
Tuesday. Return a list of restaurants with an available table (for that many people
or more) at that time, which meets all of the group’s dietary requirements.
- An endpoint that creates a reservation for a group of users. This will always be called
after the search endpoint above.
- An endpoint to delete an existing reservation.
  
### Out of scope
Only the API is in scope - the UI is out of scope. Authentication is out of scope.
