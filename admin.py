from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, jsonify, make_response, abort, Response
from functools import wraps
from datetime import datetime, date, time

from models import * ###
from inital_data import ADMIN_ROLE
from api_model_fields import DateField, TimeField



admin_ns = Namespace("admin", description="A namespace for Administration")


movie_model = admin_ns.model(
    "movie", {
        "title": fields.String(required=True),
        "description": fields.String(required=True),
        "genre": fields.String(required=True),
        "image_url": fields.String(required=True),
        "length": fields.Integer(required=True)
    }
)

movie_marshal = movie_model.extend("movie", {"id": fields.Integer(required=True)})


showtime_model = admin_ns.model(
    "showtime", {
        "movie_id": fields.Integer(required=True),
        "date": DateField(required=True),
        "time_start": TimeField(required=True),
        "time_end": TimeField(required=True),
        "seats": fields.Integer(required=True),
        "theatre": fields.String(required=True)
    }
)

showtime_marshal = showtime_model.extend(
    "showtime", {
        "id": fields.Integer(required=True),
        "seats_total": fields.Integer(required=True),
        "seats_available": fields.Integer(required=True)
    }
)
showtime_marshal.pop("seats")



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
    @admin_ns.marshal_list_with(movie_marshal)
    def get(self):
        movies: list[Movies] = Movies.query.all()
        return movies, 200
    
    @admin_required
    @admin_ns.expect(movie_model, validate=True)
    @admin_ns.marshal_with(movie_marshal)
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
    @admin_ns.marshal_with(movie_marshal)
    def get(self, id: int): # Revenue and Shows
        movie: Movies = Movies.query.get_or_404(id)
        return movie, 200

    @admin_required
    @admin_ns.expect(movie_model, validate=True)
    @admin_ns.marshal_with(movie_marshal)
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

        if length < 1:
            abort(400, "Movie length must be at least 1 minute")

        movie.update(title=title, description=description, genre=genre, image_url=image_url, length=length)

        return movie, 200

    @admin_required
    def delete(self, id):
        movie: Movies = Movies.query.get_or_404(id)
        movie.delete()
        return {}, 204



@admin_ns.route("/showtimes")
class AdminShowTimes(Resource):
    @admin_required
    def get(self):
        # id, title, description, genre, image, length
        # id, date, times, seats_available, theatre
        # id, show_id, seats, cost
        return jsonify({"message": f"epik showtimes read"})

    @admin_required
    @admin_ns.expect(showtime_model, validate=True)
    @admin_ns.marshal_with(showtime_marshal)
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
        seats: int = data.get("seats")

        # if date_ < current_date:
        #     pass
        if time_end <= time_start: # end of the day
            abort(400, "Feedback on invalid time range")
        if seats < 1:
            abort(400, "Seating capacity must be at least 1")

        new_showtime = Showings(movie_id=movie_id, date=date_, time_start=time_start, time_end=time_end, seats_total=seats, seats_available=seats, theatre=theatre)
        new_showtime.save()

        return new_showtime, 201
    

@admin_ns.route("/showtimes/<int:id>")
class AdminShowTime(Resource):
    @jwt_required()
    def get(self, id):
        # id, title, description, genre, image, length
        # id, date, times, seats_total, seats_available, theatre
        # id, show_id, seats, cost
        # reservation_id, seat_no
        return jsonify({"message": f"epik showtime get"})