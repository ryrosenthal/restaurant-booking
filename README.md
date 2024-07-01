# Restaurant Booking API with a social Twist

## Product requirements
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
Only the API is in scope - the UI is out of scope. Authentication is out of scope. Don’t worry
about hosting this somewhere publicly accessible - we can run it on your local machine.
