from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, abort
from functools import wraps
from datetime import date

from models import Users, Movies, ShowTimes, Reservations, Seats, SeatPrices, TheatreTypes
from api_model_fields import DateField, TimeField


movies_ns = Namespace("movies", description="A namespace for Movies")


base_movie_marshal = movies_ns.model(
    "movie_details", {
        "id": fields.Integer(required=True),
        "title": fields.String(required=True),
        "description": fields.String(required=True),
        "genre": fields.String(required=True),
        "image_url": fields.String(required=True), # fields.URL
        "length": fields.Integer(required=True)
    }
)

base_showtime_marshal = movies_ns.model(
    "showtime_details", {
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


movie_showtimes_marshal = movies_ns.inherit(
    "movie_showtimes_details", base_movie_marshal, {
        "showtimes": fields.Nested(base_showtime_marshal, required=True)
    }
)

movie_showtime_marshal = movies_ns.inherit(
    "movie_showtime_details", base_showtime_marshal, {
        "movie": fields.Nested(base_movie_marshal, required=True, attribute="movies")
    }
)


showtime_reservation_seat_marshal = movies_ns.model(
    "showtime_reservation_seat_details", {
        "seat_no": fields.Integer(required=True)
    }
)

showtime_reservation_seats_marshal = movies_ns.model(
    "showtime_reservation_seats_details", {
        "seats": fields.Nested(showtime_reservation_seat_marshal, required=True)
    }
)

showtime_reservations_marshal = movies_ns.inherit(
    "showtime_reservations_details", movie_showtime_marshal, {
        "reservations": fields.Nested(showtime_reservation_seats_marshal, required=True)
    }
)

reservation_model = movies_ns.model(
    "reservation", {
        "seats": fields.List(fields.Integer, required=True),
        "customers": fields.List(fields.String, required=True)
    }
)


seat_marshal = movies_ns.model(
    "seat_details", {
        "seat_no": fields.Integer(required=True),
        "customer": fields.String(required=True),
        "cost": fields.Float(required=True)
    }
)

extended_reservation_marshal = movies_ns.model(
    "reservation_details_extended", {
        "id": fields.Integer(required=True),
        "user_id": fields.Integer(required=True),
        "show_id": fields.Integer(required=True),
        "cost": fields.Float(required=True),
        "seats": fields.Nested(seat_marshal, required=True)
    }
)


theatre_marshal = movies_ns.model(
    "theatre_details", {
        "theatre": fields.String(required=True),
    }
)

seat_price_marshal = movies_ns.model(
    "seat_price_details", {
        "theatre": fields.String(required=True),
        "customer": fields.String(required=True),
        "price": fields.Float(required=True)
    }
)



def login_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        current_user_name = get_jwt_identity()
        current_user: Users = Users.query.filter_by(username=current_user_name).first()
        return f(*args, current_user.id, **kwargs)
    return decorated



@movies_ns.route("/")
class MoviesResource(Resource):
    @movies_ns.marshal_list_with(base_movie_marshal)
    def get(self): # Filter Genre
        movies: list[Movies] = Movies.query.all()
        return movies, 200



@movies_ns.route("/<int:id>")
class MovieResource(Resource):
    @movies_ns.marshal_with(movie_showtimes_marshal)
    def get(self, id):
        movie: Movies = Movies.query.get_or_404(id)
        movie.showtimes.sort(key = lambda showtime: showtime.date)
        movie.showtimes = [showtime for showtime in movie.showtimes if date.today() <= showtime.date]
        return movie, 200



@movies_ns.route("/showtimes")
class MovieShowTimes(Resource):
    @movies_ns.marshal_list_with(movie_showtime_marshal)
    def get(self): # Filter Date + Time, Theatre
        showtimes: list[ShowTimes] = ShowTimes.query.filter(date.today() <= ShowTimes.date).order_by(ShowTimes.date, ShowTimes.time_start).all()
        return showtimes, 200



@movies_ns.route("/showtimes/<int:show_id>")
class MovieReservation(Resource):
    @movies_ns.marshal_with(showtime_reservations_marshal)
    def get(self, show_id: int):
        showtime: ShowTimes = ShowTimes.query.get_or_404(show_id)
        return showtime, 200

    @login_required
    @movies_ns.expect(reservation_model, validate=True)
    @movies_ns.marshal_with(extended_reservation_marshal)
    def post(self, user_id: int, show_id: int):
        showtime: ShowTimes = ShowTimes.query.get_or_404(show_id)

        data: dict = request.get_json()
        seats: set = set(data["seats"])
        customers: list = data["customers"]

        if len(seats) != len(customers):
            abort(400, "Invalid amount of seats reserved for supplied amount of customers")

        if not seats:
            abort(400, "Reservation must reserve at least 1 seat")

        for seat_no in seats:
            if seat_no < 1 or showtime.seats_total < seat_no:
                abort(400, "An invalid seat was supplied")
            if Seats.query.join(Reservations).filter(Seats.seat_no==seat_no, Reservations.show_id==showtime.id).first():
                abort(400, "A supplied seat has already been reserved")

        if any(not SeatPrices.query.get((customer, showtime.theatre)) for customer in customers):
            abort(400, "An invalid customer type was supplied")

        # Database Transaction

        new_reservation = Reservations(user_id=user_id, show_id=show_id)
        new_reservation.save()

        for seat_no, customer in zip(seats, customers):
            seat = Seats(reservation_id=new_reservation.id, seat_no=seat_no, customer=customer)
            seat.save()

        return new_reservation, 201
    


@movies_ns.route("/theatres")
class TheatresResource(Resource):
    @movies_ns.marshal_list_with(theatre_marshal)
    def get(self):
        theatres: list[TheatreTypes] = TheatreTypes.query.all()
        return theatres, 200



@movies_ns.route("/seatPricing")
class SeatPricingResource(Resource):
    @movies_ns.marshal_list_with(seat_price_marshal)
    def get(self):
        theatre: str | None = request.args.get("theatre")
        if theatre:
            seat_prices: list[SeatPrices] = SeatPrices.query.filter_by(theatre=theatre).all()
        else:
            seat_prices: list[SeatPrices] = SeatPrices.query.all()
        return seat_prices, 200