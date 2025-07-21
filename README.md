# Blogging Platform API
A solution to the [Movie Reservation System](https://roadmap.sh/projects/movie-reservation-system) project available on [roadmap.sh](https://roadmap.sh).

This project is a simple web application for a movie theatre reservation system, comprised of a backend RESTful API and a frontend Web Server. 

The backend API supports CRUD operations through HTTP request methods, for creating, reading, updating, and deleting user, movie, showtime, and reservation data. To perform operations, users must authenticate to recieve a JSON Web Token (JWT) which handles their session.

The frontent Server provides a user-friendly interface to access the backend API through using a web browser. 

## Features
- **User Authentication:** User's can authenticate into the application using their credentials. Different user roles exist, such as regular and admin, which provide users different levels of access or permission in the application
- **Movie Browsing:** Movies results can be viewed and filtered (search keywords, genre, runtime)
- **Showtime Browsing:** Showtime results can be viewed and filtered (theatre type, date)
- **Theatre Seats Reservation:** Authenticated user's can select and reserve theatre seats for a specific movie showtime
- **Admin Operations:** Authenticated admin user's can manage movies and showtime information

## Installation
```bash
git clone https://github.com/TheTrueJM/MovieReservationSystem.git
cd MovieReservationSystem
py -m venv .venv

# For Windows
source .venv/Scripts/activate
# For Linux / MacOS
source .venv/bin/activate

pip install -r requirements.txt
```

### Enviroment Variable Setup (.env File)
```bash
# Set the Flask Server's Secret Key
SECRET_KEY=#Enter Secret Key, e.g. MySecret

## Optional Settings

# Change the Application Database's Type or Name
DATABASE_URI=#Enter Database URI, e.g. sqlite:///movies.db

# Create an inital Admin User during Setup
CREATE_ADMIN=True # true / T / 1 are also Valid, Defaults to False
ADMIN_USERNAME=#Enter Admin User's Name, e.g. AdminUser
ADMIN_PASSWORD=#Enter Admin User's Password, e.g. AdminPass

# Import inital Movies Data from The Movie Database (TMDB - https://www.themoviedb.org)
IMPORT_TMDB_MOVIES=True # true / T / 1 are also Valid, Defaults to False
TMDB_API_KEY=#Enter Valid API Key from Your TMDB Account, information available at https://developer.themoviedb.org/docs/getting-started
# Include Runtime with imported Movies. Note: This will make many additional API Requests
INCLUDE_RUNTIME=True # true / T / 1 are also Valid, Defaults to False
```

### Run
> Backend API (localhost:5000)
```bash
py ./run.py
```

> Frontend Server (localhost:5500)
```bash
# Open New Terminal Window
cd frontend
py ./main.py
```

## Usage
### Auth
**Sign Up**
```bash
POST http://localhost:5000/auth/signup
Content-Type: application/json

{
    "username": "NewUser",
    "password": "MyPassword"
}
```
> HTTP Response: 201
```json
{
  "message": "User sign up successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiYjQzMmFkZTktNTNjZC00MmI1LWEyNDAtN2I5MmI1OTMzNzdmIiwidHlwZSI6InJlZnJlc2giLCJzdWIiOiJOZXdVc2VyIiwibmJmIjoxNzUyNTQ4MjUwLCJjc3JmIjoiOTg2MWZlOTYtOTUzMC00OTY2LWE2NWUtYTIxYTMzNjI3ODFhIiwiZXhwIjoxNzU1MTQwMjUwfQ.PXPciaUmog37pad8e2g64OblAZrKV1sAhojqfTcIIzQ"
}
```
> HTTP Errors: 400, 401

**Login**
```bash
POST http://localhost:5000/auth/login
Content-Type: application/json

{
    "username": "NewUser",
    "password": "MyPassword"
}
```
> HTTP Response: 200
```json
{
  "message": "User login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiYjQzMmFkZTktNTNjZC00MmI1LWEyNDAtN2I5MmI1OTMzNzdmIiwidHlwZSI6InJlZnJlc2giLCJzdWIiOiJOZXdVc2VyIiwibmJmIjoxNzUyNTQ4MjUwLCJjc3JmIjoiOTg2MWZlOTYtOTUzMC00OTY2LWE2NWUtYTIxYTMzNjI3ODFhIiwiZXhwIjoxNzU1MTQwMjUwfQ.PXPciaUmog37pad8e2g64OblAZrKV1sAhojqfTcIIzQ"
}
```
> HTTP Errors: 400, 401

**Access Token Refresh**
```bash
GET http://localhost:5000/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiYjQzMmFkZTktNTNjZC00MmI1LWEyNDAtN2I5MmI1OTMzNzdmIiwidHlwZSI6InJlZnJlc2giLCJzdWIiOiJOZXdVc2VyIiwibmJmIjoxNzUyNTQ4MjUwLCJjc3JmIjoiOTg2MWZlOTYtOTUzMC00OTY2LWE2NWUtYTIxYTMzNjI3ODFhIiwiZXhwIjoxNzU1MTQwMjUwfQ.PXPciaUmog37pad8e2g64OblAZrKV1sAhojqfTcIIzQ
```
> HTTP Response: 200
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA"
}
```
> HTTP Errors: 400

**Check Admin Status**
```bash
GET http://localhost:5000/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA
```
> HTTP Response: 200
```json
{
  "admin_status": false
}
```
> HTTP Errors: 400

### Movies
**View Movies**
```bash
GET http://localhost:5000/movies/
```
> Optional Parameters
```bash
?query=Super # Query String to Search Title and Description
?genre=Fiction
?runtime-min=60
?runtime-max=120
```
> HTTP Response: 200
```json
[
  {
    "id": 2,
    "title": "Superman",
    "description": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
    "genre": "Science Fiction",
    "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg",
    "length": 130
  },
  {
    "id": 1,
    "title": "Thunderbolts*",
    "description": "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission that will force them to confront the darkest corners of their pasts.",
    "genre": "Action",
    "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg",
    "length": 127
  },
]
```

**View Movie**
```bash
GET http://localhost:5000/movies/2
```
> HTTP Response: 200
```json
{
  "showtimes": [
    {
      "id": 1,
      "movie_id": 2,
      "date": "2025-07-11",
      "time_start": "18:00:00",
      "time_end": "20:10:00",
      "seats_total": 50,
      "seats_available": 48,
      "theatre": "premium"
    },
  ],
  "id": 2,
  "title": "Superman",
  "description": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
  "genre": "Science Fiction",
  "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg",
  "length": 130
}
```
> HTTP Errors: 404

**View Showtimes**
```bash
GET http://localhost:5000/movies/showtimes
```
> Optional Parameters
```bash
?theatre=premium
?date=2025-07-11
?date-start=2025-07-08
?date-end=2025-07-14
```
> HTTP Response: 200
```json
[
  {
    "movie": {
      "id": 2,
      "title": "Superman",
      "description": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
      "genre": "Science Fiction",
      "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg",
      "length": 130
    },
    "id": 1,
    "movie_id": 2,
    "date": "2025-07-11",
    "time_start": "18:00:00",
    "time_end": "20:10:00",
    "seats_total": 50,
    "seats_available": 48,
    "theatre": "premium"
  },
]
```

**View Movie Showtime**
```bash
GET http://localhost:5000/movies/showtimes/1
```
> HTTP Response: 200
```json
{
  "reservations": [
    {
      "seats": [
        {
          "seat_no": 49
        },
        {
          "seat_no": 50
        }
      ]
    }
  ],
  "movie": {
    "id": 2,
    "title": "Superman",
    "description": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
    "genre": "Science Fiction",
    "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg",
    "length": 130
  },
  "id": 1,
  "movie_id": 2,
  "date": "2025-07-11",
  "time_start": "18:00:00",
  "time_end": "20:10:00",
  "seats_total": 50,
  "seats_available": 48,
  "theatre": "premium"
}
```
> HTTP Errors: 404

**Reserve Movie Showtime Seats**
```bash
POST http://localhost:5000/movies/showtimes/1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA

{
    "seats": [1, 2, 3, 4],
    "customers": ["child, "child", "adult", "adult"]
}
```
> HTTP Response: 201
```json
{
  "id": 2,
  "user_id": 1,
  "show_id": 1,
  "cost": 70.0,
  "seats": [
    {
      "seat_no": 1,
      "customer": "child",
      "cost": 15.0
    },
    {
      "seat_no": 2,
      "customer": "child",
      "cost": 15.0
    },
    {
      "seat_no": 3,
      "customer": "adult",
      "cost": 20.0
    }
    {
      "seat_no": 4,
      "customer": "adult",
      "cost": 20.0
    }
  ]
}
```
> HTTP Errors: 400, 401, 404

**View Theatre Types**
```bash
GET http://localhost:5000/movies/theatres
```
> HTTP Response: 200
```json
[
  {
    "theatre": "standard"
  },
  {
    "theatre": "premium"
  }
]
```


**View Seat Pricing**
```bash
GET http://localhost:5000/movies/seatPricing
```
> Optional Parameters
```bash
?theatre=premium
```
> HTTP Response: 200
```json
[
  {
    "customer": "child",
    "theatre": "standard",
    "price": 10.0
  },
  {
    "customer": "adult",
    "theatre": "standard",
    "price": 14.0
  },
  {
    "customer": "child",
    "theatre": "premium",
    "price": 15.0
  },
  {
    "customer": "adult",
    "theatre": "premium",
    "price": 20.0
  },
]
```

### User
**View Reservations**
```bash
GET http://localhost:5000/user/reservations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA
```
> HTTP Response: 200
```json
[
{
    "showtime": {
      "movie": {
        "id": 2,
        "title": "Superman",
        "description": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
        "genre": "Science Fiction",
        "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg",
        "length": 130
      },
      "id": 1,
      "movie_id": 2,
      "date": "2025-07-11",
      "time_start": "18:00:00",
      "time_end": "20:10:00",
      "seats_total": 50,
      "seats_available": 48,
      "theatre": "premium"
    },
    "id": 2,
    "user_id": 1,
    "show_id": 1,
    "cost": 70.0,
    "seats": [
      {
        "seat_no": 1,
        "customer": "child",
        "cost": 15.0
      },
      {
        "seat_no": 2,
        "customer": "child",
        "cost": 15.0
      },
      {
        "seat_no": 3,
        "customer": "adult",
        "cost": 20.0
      }
      {
        "seat_no": 4,
        "customer": "adult",
        "cost": 20.0
      }
    ]
  },
]
```
> HTTP Errors: 401


**View Reservation**
```bash
GET http://localhost:5000/user/reservations/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA
```
> HTTP Response: 201
```json
{
  "reservations": [
    {
      "seats": [
        {
          "seat_no": 1
        },
        {
          "seat_no": 2
        }
        {
          "seat_no": 3
        },
        {
          "seat_no": 4
        }
        {
          "seat_no": 49
        },
        {
          "seat_no": 50
        }
      ]
    }
  ],
  "movie": {
    "id": 2,
    "title": "Superman",
    "description": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
    "genre": "Science Fiction",
    "image_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg",
    "length": 130
  },
  "id": 1,
  "movie_id": 2,
  "date": "2025-07-11",
  "time_start": "18:00:00",
  "time_end": "20:10:00",
  "seats_total": 50,
  "seats_available": 48,
  "theatre": "premium",
  "seats": [
        {
          "seat_no": 1,
          "customer": "child",
          "cost": 15.0
        },
        {
          "seat_no": 2,
          "customer": "child",
          "cost": 15.0
        },
        {
          "seat_no": 3,
          "customer": "adult",
          "cost": 20.0
        }
        {
          "seat_no": 4,
          "customer": "adult",
          "cost": 20.0
        }
      ]
}
```
> HTTP Errors: 401, 404

**Update Reservation**
```bash
POST http://localhost:5000/user/reservations/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA

{
    "seats": [1, 2],
    "customers": ["child, "adult"]
}
```
> HTTP Response: 201
```json
{
  "id": 2,
  "user_id": 1,
  "show_id": 1,
  "cost": 35.0,
  "seats": [
    {
      "seat_no": 1,
      "customer": "child",
      "cost": 15.0
    },
    {
      "seat_no": 2,
      "customer": "adult",
      "cost": 20.0
    }
  ]
}
```
> HTTP Errors: 400, 401, 404

**Cancel Reservation**
```bash
DELETE http://localhost:5000/user/reservations/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA
```
> HTTP Response: 204 \
> HTTP Errors: 401, 404

**Update Username**
```bash
PUT http://localhost:5000/user/updateUsername
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA

{
    "username": "NewerUser"
}
```
> HTTP Response: 200
```json
{
  "message": "Username successfully updated to 'NewerUser'",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU1MTA5NiwianRpIjoiNTM3YTc2ODgtOGU1Yy00NzY5LTkxNTUtMWE4ZTg2NTgzNDE4IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld2VyVXNlciIsIm5iZiI6MTc1MjU1MTA5NiwiY3NyZiI6IjYwY2JiYzBiLTE1YTQtNDBlZi05NDI4LTRiYjNiMDYzN2RkNCIsImV4cCI6MTc1MjU1MTk5Nn0.AnT4VwBUuFIFqO_DAeRN3E-9F96QXqF2kE9MtihYk-E",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU1MTA5NiwianRpIjoiOGFiMWQ1NTEtYWY0ZS00MjFlLWIyMWEtZDlkYzgwOWZmMzQ4IiwidHlwZSI6InJlZnJlc2giLCJzdWIiOiJOZXdlclVzZXIiLCJuYmYiOjE3NTI1NTEwOTYsImNzcmYiOiJmNGZjNzlhYi04YTg4LTQ0ZTItOGJlYy03N2NjNDI0YWVmODAiLCJleHAiOjE3NTUxNDMwOTZ9.vWQnkVyyYUyT5ri0qIYz8a7shQXHZJcO3uU9w1Ku1Jg"
}
```
> HTTP Errors: 400, 401

**Update Password**
```bash
PUT http://localhost:5000/user/updatePassword
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MjU0ODI1MCwianRpIjoiODNjMThiMzctMDkzOC00NDIxLTlmNmMtOTRmYzhlNDUyNzAyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Ik5ld1VzZXIiLCJuYmYiOjE3NTI1NDgyNTAsImNzcmYiOiIwODQzNmI3OC1jMmMwLTRhYWMtYWY0YS00NmZmYTM0MDJjMzMiLCJleHAiOjE3NTI1NDkxNTB9.gN8bU3chHSJj4UDMY0V2A3K1irz7quC1j4MoOil0ymA

{
    "current_password": "MyPassword",
    "new_password": "NewPassword"
}
```
> HTTP Response: 200
```json
{
  "message": "Password successfully updated"
}
```
> HTTP Errors: 400, 401

### Admin
