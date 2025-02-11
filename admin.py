from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, abort
from functools import wraps
from datetime import datetime, date, time

from models import Users, Movies, ShowTimes, Reservations, TheatreTypes
from inital_data import ADMIN_ROLE
from api_model_fields import DateField, TimeField



admin_ns = Namespace("admin", description="A namespace for Administration")


movie_model = admin_ns.model(
    "movie", {
        "title": fields.String(required=True),
        "description": fields.String(required=True),
        "genre": fields.String(required=True),
        "image_url": fields.String(required=True), # fields.URL
        "length": fields.Integer(required=True)
    }
)

base_movie_marshal = admin_ns.inherit("movie_details", movie_model, {"id": fields.Integer(required=True)})

extended_movie_marshal = admin_ns.inherit("movie_details_extended", base_movie_marshal, {"revenue": fields.Float(required=True)})


showtime_model = admin_ns.model(
    "showtime", {
        "movie_id": fields.Integer(required=True),
        "date": DateField(required=True),
        "time_start": TimeField(required=True),
        "time_end": TimeField(required=True),
        "seats_total": fields.Integer(required=True),
        "theatre": fields.String(required=True)
    }
)

extended_showtime_marshal = admin_ns.inherit(
    "showtime_details_extended", showtime_model, {
        "id": fields.Integer(required=True),
        "seats_available": fields.Integer(required=True),
        "revenue": fields.Float(required=True)
    }
)


extended_movie_showtimes_marshal = admin_ns.inherit(
    "movie_showtimes_details_extended", extended_movie_marshal, {
        "showtimes": fields.Nested(extended_showtime_marshal, required=True)
    }
)

extended_movie_showtime_marshal = admin_ns.inherit(
    "movie_showtime_details_extended", extended_showtime_marshal, {
        "movie": fields.Nested(extended_movie_marshal, required=True, attribute="movies")
    }
)


extended_showtime_reservations_marshal = admin_ns.inherit(
    "showtime_reservations_details_extended", extended_movie_showtime_marshal, {
        "reservations": fields.Nested({
            "id": fields.Integer(required=True),
            "user_id": fields.Integer(required=True),
            "cost": fields.Float(required=True),
            "seats": fields.Nested({
                "seat_no": fields.Integer(required=True),
                "customer": fields.String(required=True),
                "cost": fields.Float(required=True)
            }, required=True)
        }, required=True)
    }
)




def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        current_user_name = get_jwt_identity()
        current_user: Users = Users.query.filter_by(username=current_user_name).first()

        if current_user.role != ADMIN_ROLE:
            abort(404, "Page doesn't exist") ###
        
        return f(*args, **kwargs)
    return decorated



@admin_ns.route("/movies")
class AdminMovies(Resource):
    @admin_required
    @admin_ns.marshal_list_with(extended_movie_marshal)
    def get(self): # Filter Genre
        movies: list[Movies] = Movies.query.all()
        return movies, 200
    
    @admin_required
    @admin_ns.expect(movie_model, validate=True)
    @admin_ns.marshal_with(base_movie_marshal)
    def post(self):
        data: dict = request.get_json()
        title: str = data.get("title")
        description: str = data.get("description")
        genre: str = data.get("genre")
        image_url: str = data.get("image_url")
        length: int = data.get("length")

        if not title or not genre or not image_url:
            abort(400, "Feedback on missing values")

        if length < 1:
            abort(400, "Movie length must be at least 1 minute")

        new_movie = Movies(title=title, description=description, genre=genre, image_url=image_url, length=length)
        new_movie.save()

        return new_movie, 201


@admin_ns.route("/movies/<int:id>")
class AdminMovie(Resource):
    @admin_required
    @admin_ns.marshal_with(extended_movie_showtimes_marshal)
    def get(self, id: int):
        movie: Movies = Movies.query.get_or_404(id)
        return movie, 200

    @admin_required
    @admin_ns.expect(movie_model, validate=True)
    @admin_ns.marshal_with(base_movie_marshal)
    def put(self, id: int):
        movie: Movies = Movies.query.get_or_404(id)

        data: dict = request.get_json()
        title: str = data.get("title")
        description: str = data.get("description")
        genre: str = data.get("genre")
        image_url: str = data.get("image_url")
        length: int = data.get("length")

        if not title or not genre or not image_url:
            abort(400, "Feedback on missing values")

        if movie.showtimes and length != movie.length:
            abort(400, "Cannot change length of movie with showtimes")

        if length < 1:
            abort(400, "Movie length must be at least 1 minute")

        movie.update(title=title, description=description, genre=genre, image_url=image_url, length=length)

        return movie, 200

    @admin_required
    def delete(self, id: int):
        movie: Movies = Movies.query.get_or_404(id)

        for showtime in movie.showtimes:
            reservations: list[Reservations] = Reservations.query.filter_by(show_id=showtime.id).first()
            if reservations:
                abort(400, "Cannot remove movie that has showtime reservations")

        movie.delete()
        return {}, 204



@admin_ns.route("/showtimes")
class AdminShowTimes(Resource):
    @admin_required
    @admin_ns.marshal_list_with(extended_movie_showtime_marshal)
    def get(self): # Filter Date + Time, Theatre
        showtimes: list[ShowTimes] = ShowTimes.query.all()
        return showtimes, 200

    @admin_required
    @admin_ns.expect(showtime_model, validate=True)
    @admin_ns.marshal_with(extended_movie_showtime_marshal)
    def post(self):
        data: dict = request.get_json()

        movie_id: int = data.get("movie_id")
        movie: Movies | None = Movies.query.get(movie_id)
        if not movie:
            abort(400, "Feedback on movie doesn't exist")

        theatre: str = data.get("theatre")
        if not TheatreTypes.query.get(theatre):
            abort(400, "Feedback on theatre type doesn't exist")

        date_: date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
        time_start: time = datetime.strptime(data.get("time_start"), "%H:%M:%S").time()
        time_end: time = datetime.strptime(data.get("time_end"), "%H:%M:%S").time()
        seats: int = data.get("seats_total")

        if date_ < date.today():
            abort(400, "Feedback on invalid date before today")
        
        if time_end <= time_start: # end of the day
            abort(400, "Feedback on invalid time range")
        
        if seats < 1:
            abort(400, "Seating capacity must be at least 1")

        new_showtime = ShowTimes(movie_id=movie_id, date=date_, time_start=time_start, time_end=time_end, seats_total=seats, seats_available=seats, theatre=theatre)
        new_showtime.save()

        return new_showtime, 201
    

@admin_ns.route("/showtimes/<int:id>")
class AdminShowTime(Resource):
    @admin_required
    @admin_ns.marshal_with(extended_showtime_reservations_marshal)
    def get(self, id: int):
        showtime: ShowTimes = ShowTimes.query.get_or_404(id)
        return showtime, 200
    
    @admin_required
    def delete(self, id: int):
        showtime: ShowTimes = ShowTimes.query.get_or_404(id)

        if showtime.reservations:
            abort(400, "Cannot remove showtime that has reservations")

        showtime.delete()
        return {}, 204