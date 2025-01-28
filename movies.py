from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, abort
from datetime import date, time

from models import * ###
from api_model_fields import DateField, TimeField


movies_ns = Namespace("movies", description="A namespace for Movies")


movie_marshal = movies_ns.model(
    "movie", {
        "id": fields.Integer(required=True),
        "title": fields.String(required=True),
        "description": fields.String(required=True),
        "genre": fields.String(required=True),
        "image_url": fields.String(required=True),
        "length": fields.Integer(required=True)
    }
)


showtime_marshal = movies_ns.model(
    "showtime", {
        "id": fields.Integer(required=True),
        "movie_id": fields.Integer(required=True),
        "date": DateField(required=True),
        "time_start": TimeField(required=True),
        "time_end": TimeField(required=True),
        "seats_total": fields.Integer(required=True),
        "seats_available": fields.Integer(required=True),
        "theatre": fields.String(required=True)
    }
)


reservation_model = movies_ns.model(
    "reservation", {
        "seats": fields.List(fields.Integer, required=True),
        "customers": fields.List(fields.String, required=True)
    }
)

seat_marshal = movies_ns.model(
    "seat", {
        "seat_no": fields.Integer(required=True),
        "customer": fields.String(required=True)
    }
)

reservation_marshal = movies_ns.model(
    "reservation", {
        "id": fields.Integer(required=True),
        "user_id": fields.Integer(required=True),
        "show_id": fields.Integer(required=True),
        "cost": fields.Float(required=True),
        "seats": fields.Nested(seat_marshal, required=True)
    }
)



def get_user() -> Users:
    current_user_name = get_jwt_identity()
    current_user: Users = Users.query.filter_by(username=current_user_name).first()
    return current_user



@movies_ns.route("/")
class MoviesResource(Resource):
    @movies_ns.marshal_list_with(movie_marshal)
    def get(self):
        movies: list[Movies] = Movies.query.all()
        return movies, 200



@movies_ns.route("/<int:id>")
class MovieResource(Resource):
    @movies_ns.marshal_with(movie_marshal)
    def get(self, id):
        # id, title, description, genre, image, length
        # id, date, times, seats_available, theatre
        movie: Movies = Movies.query.get_or_404(id)
        return movie, 200
    


@movies_ns.route("/showtimes")
class MovieShowTimes(Resource):
    def get(self): # Filter Date + Time, Theatre
        movies = Movies.query.all()
        # id, title, description, genre, image, length
        # id, date, times, seats_available, theatre
        return movies



@movies_ns.route("/showtimes/<int:show_id>")
class MovieReservation(Resource):
    @jwt_required()
    def get(self, show_id: int):
        movie = Movies.query.get_or_404(show_id)
        # id, title, description, genre, image, length
        # id, date, times, seats_total, seats_available, theatre
        # id, show_id
        # reservation_id, seat_no
        # customer, theatre, price
        return movie

    @jwt_required()
    @movies_ns.expect(reservation_model, validate=True)
    @movies_ns.marshal_with(reservation_marshal)
    def post(self, show_id: int):
        # show_id, user_id, [seat_no], [customer_type]

        showtime: ShowTimes = ShowTimes.query.get_or_404(show_id)

        data = request.get_json()
        seats = data["seats"] ### Check Seats aren't Already Reserved
        customers = data["customers"]

        if len(seats) != len(customers):
            abort(400, "Feedback on seats reserved to customers mismatch")

        if any(seat_no < 1 or showtime.seats_total < seat_no for seat_no in seats):
            abort(400, "Feedback on invalid seat selected")

        if any(not SeatPrices.query.get((customer, showtime.theatre)) for customer in customers):
            abort(400, "Feedback on invalid customer selected")

        user: Users = get_user()

        # Database Transaction

        new_reservation = Reservations(user_id=user.id, show_id=show_id)
        new_reservation.save()

        for seat_no, customer in zip(seats, customers):
            new_seat = Seats(reservation_id=new_reservation.id, seat_no=seat_no, customer=customer)
            new_seat.save()

        return new_reservation, 201



# @movies_ns.route("/test")
# class TestResource(Resource):
#     def get(self):

#         reservation = Reservations(user_id=1, show_id=1)
#         reservation.save()

#         seats = {2: "adult", 3: "child", 14: "senior"}
#         for seat_no in seats:
#             seat = Seats(reservation_id=reservation.id, seat_no=seat_no, customer=seats[seat_no])
#             seat.save()


#         print(reservation.seats, reservation.cost)
#         print(Seats.query.all())


#         return {"message": "Hello World"}