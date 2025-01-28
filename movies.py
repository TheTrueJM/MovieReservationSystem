from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required
from flask import request, jsonify, make_response, abort, Response
from datetime import date, time

from models import * ###
# from http_response import http_ok, http_created, http_bad_request, http_unauthorised


movies_ns = Namespace("movies", description="A namespace for Movies")



def movie_model(movie: Movies) -> dict:
    return {
        "id": movie.id,
        "title": movie.title,
        "description": movie.description,
        "genre": movie.genre,
        "image": movie.image_url,
        "length": movie.length
    }

def showtime_model(movie: Movies) -> dict:
    return {
        "id": movie.id,
        "title": movie.title,
        "description": movie.description,
        "genre": movie.genre,
        "image": movie.image_url,
        "length": movie.length
    }



@movies_ns.route("/")
class MoviesResource(Resource):
    def get(self):
        movies: list[Movies] = Movies.query.all()
        # id, title, description, genre, image, length
        return jsonify([movie_model(movie) for movie in movies])



@movies_ns.route("/showtimes")
class MovieShowTimes(Resource):
    def get(self): # Filter Date + Time, Theatre
        movies = Movies.query.all()
        # id, title, description, genre, image, length
        # id, date, times, seats_available, theatre
        return movies



@movies_ns.route("/<int:id>")
class MovieResource(Resource):
    def get(self, id):
        movie = Movies.query.get_or_404(id)
        # id, title, description, genre, image, length
        # id, date, times, seats_available, theatre
        return jsonify(movie_model(movie))



@movies_ns.route("/<int:id>/reservation")
class MovieReservation(Resource):
    @jwt_required()
    def get(self, id):
        movie = Movies.query.get_or_404(id)
        # id, title, description, genre, image, length
        # id, date, times, seats_total, seats_available, theatre
        # id, show_id
        # reservation_id, seat_no
        # customer, theatre, price
        return movie

    @jwt_required()
    def post(self):
        # show_id, user_id, [seat_no], [customer_type]
        # Database Transaction

        data = request.get_json()
        return data, 201



# @movies_ns.route("/test")
# class TestResource(Resource):
#     def get(self):

#         showing = Showings(movie_id=1, date=date(2025, 1, 26), time_start=time(10, 30), time_end=time(11, 30), seats_total=50, seats_available=50, theatre="standard")
#         showing.save()
#         reservation = Reservations(user_id=1, show_id=1)
#         reservation.save()

#         seats = {2: "adult", 3: "child", 14: "senior"}
#         for seat_no in seats:
#             seat = Seats(reservation_id=reservation.id, seat_no=seat_no, customer=seats[seat_no])
#             seat.save()


#         print(reservation.seats, reservation.cost)
#         print(Seats.query.all())


#         return {"message": "Hello World"}