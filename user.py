from flask_restx import Resource, Namespace, fields
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from flask import request, abort
from functools import wraps
from datetime import date

from models import * ###
from api_model_fields import DateField, TimeField


user_ns = Namespace("user", description="A namespace for User")


username_model = user_ns.model(
    "username", {
        "username": fields.String(required=True)
    }
)

username_marshal = user_ns.model(
    "username_response", {
        "message": fields.String(required=True),
        "access_token": fields.String(required=True),
        "refresh_token": fields.String(required=True)
    }
)

password_model = user_ns.model(
    "password", {
        "current_password": fields.String(required=True),
        "new_password": fields.String(required=True)
    }
)

password_marshal = user_ns.model(
    "password_response", {
        "message": fields.String(required=True)
    }
)


base_movie_marshal = user_ns.model(
    "movie_details", {
        "id": fields.Integer(required=True),
        "title": fields.String(required=True),
        "description": fields.String(required=True),
        "genre": fields.String(required=True),
        "image_url": fields.String(required=True), # fields.URL
        "length": fields.Integer(required=True)
    }
)

base_showtime_marshal = user_ns.model(
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


movie_showtime_marshal = user_ns.inherit(
    "movie_showtime_details", base_showtime_marshal, {
        "movie": fields.Nested(base_movie_marshal, required=True, attribute="movies")
    }
)


reservation_model = user_ns.model(
    "reservation", {
        "seats": fields.List(fields.Integer, required=True),
        "customers": fields.List(fields.String, required=True)
    }
)

reservation_marshal = user_ns.model(
    "reservation_details", {
        "id": fields.Integer(required=True),
        "user_id": fields.Integer(required=True),
        "show_id": fields.Integer(required=True),
        "cost": fields.Float(required=True),
        "seats": fields.Nested({
            "seat_no": fields.Integer(required=True),
            "customer": fields.String(required=True),
            "cost": fields.Float(required=True)
        }, required=True)
    }
)


user_reservation_marshal = user_ns.inherit( ### Rename it
    "user_reservation_details", reservation_marshal, {
        "showtime": fields.Nested(movie_showtime_marshal, required=True, attribute="showtimes")
    }
)



def login_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        current_user_name = get_jwt_identity()
        current_user: Users = Users.query.filter_by(username=current_user_name).first()
        return f(*args, current_user, **kwargs)
    return decorated



@user_ns.route("/update_username")
class UserResource(Resource):
    @login_required
    @user_ns.expect(username_model, validate=True)
    @user_ns.marshal_with(username_marshal)
    def put(self, user: Users):
        data: dict = request.get_json()
        username: str = data.get("username")
        
        if not username:
            abort(400, "Feedback on missing values")

        if Users.query.filter_by(username=username).first():
            abort(401, f"User '{username}' already exists")

        user.update(username=username, password=user.password)

        access_token = create_access_token(identity=username) ### expires_delta
        refresh_token = create_refresh_token(identity=username)
        return {
            "message": f"Username successfully updated to '{username}'",
            "access_token": access_token, "refresh_token": refresh_token
        }, 200


@user_ns.route("/update_password")
class UserResource(Resource):
    @login_required
    @user_ns.expect(password_model, validate=True)
    @user_ns.marshal_with(password_marshal)
    def put(self, user: Users):
        data: dict = request.get_json()
        current_password: str = data.get("current_password")
        new_password: str = data.get("new_password")
        
        if not new_password:
            abort(400, "Feedback on missing values")

        if not check_password_hash(user.password, current_password):
            abort(401, f"Current password is incorrect")

        user.update(username=user.username, password=generate_password_hash(new_password))
        return {"message": "Password successfully updated"}, 200



@user_ns.route("/reservations")
class UserReservations(Resource):
    @login_required
    @user_ns.marshal_list_with(user_reservation_marshal)
    def get(self, user: Users): # Filter Date + Time, Theatre
        reservations: list[Reservations] = Reservations.query.filter_by(user_id=user.id).all()
        return reservations, 200
    

@user_ns.route("/reservations/<int:reservation_id>")
class UserReservation(Resource):
    def get_reservation_or_404(self, reservation_id: int, user_id: int) -> Reservations:
        return Reservations.query.filter(Reservations.id==reservation_id, Reservations.user_id==user_id).first_or_404()

    @login_required
    @user_ns.marshal_with(user_reservation_marshal)
    def get(self, user: Users, reservation_id: int):
        reservation: Reservations = self.get_reservation_or_404(reservation_id, user.id)
        return reservation, 200

    @login_required
    @user_ns.expect(reservation_model, validate=True)
    @user_ns.marshal_with(user_reservation_marshal)
    def put(self, user: Users, reservation_id: int):
        reservation: Reservations = self.get_reservation_or_404(reservation_id, user.id)
        showtime: ShowTimes = ShowTimes.query.get(reservation.show_id)

        data: dict = request.get_json()
        seats: set = set(data["seats"])
        customers: list = data["customers"]

        if len(seats) != len(customers):
            abort(400, "Feedback on seats reserved to customers mismatch")

        for seat_no in seats:
            if seat_no < 1 or showtime.seats_total < seat_no:
                abort(400, "Feedback on invalid seat selected")
            if Seats.query.join(Reservations).filter(Reservations.id!=reservation_id, Seats.seat_no==seat_no, Reservations.show_id==showtime.id).first():
                abort(400, "Feedback on seat already reserved")

        if any(not SeatPrices.query.get((customer, showtime.theatre)) for customer in customers):
            abort(400, "Feedback on invalid customer selected")

        # Database Transaction

        old_seats: list[Seats] = Seats.query.filter_by(reservation_id=reservation_id)
        for seat in old_seats:
            seat.delete()

        for seat_no, customer in zip(seats, customers):
            new_seat = Seats(reservation_id=reservation.id, seat_no=seat_no, customer=customer)
            new_seat.save()

        return reservation, 200

    @login_required
    def delete(self, user: Users, reservation_id: int):
        reservation: Reservations = self.get_reservation_or_404(reservation_id, user.id)
        reservation.delete()
        return {}, 204