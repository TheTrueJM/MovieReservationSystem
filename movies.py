from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required
from flask import request

from models import *
from datetime import date, time



movies_ns = Namespace("movies", description="A namespace for Movies")



@movies_ns.route("/test")
class TestResource(Resource):
    def get(self):

        user = Users(username="user", password="password", role="regular")
        user.save()
        movie = Movies(title="test movie", description="nothing important", genre="movie", image_url="random", length=60)
        movie.save()
        showing = Showings(movie_id=1, date=date(2025, 1, 26), time_start=time(10, 30), time_end=time(11, 30), seats_total=50, seats_available=50, theatre="standard")
        showing.save()
        reservation = Reservations(user_id=1, show_id=1)
        reservation.save()

        seats = {2: "adult", 3: "child", 14: "senior"}
        for seat_no in seats:
            seat = Seats(reservation_id=reservation.id, seat_no=seat_no, customer=seats[seat_no])
            seat.save()


        print(reservation.seats, reservation.cost)
        print(Seats.query.all())


        return {"message": "Hello World"}