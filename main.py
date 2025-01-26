from flask import Flask
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from database import db
from models import Users, Movies, Showings, Reservations, Seats
from auth import auth_ns
from movies import movies_ns


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)

    CORS(app)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    JWTManager(app)

    api = Api(app, doc="/docs")

    api.add_namespace(auth_ns)
    api.add_namespace(movies_ns)

    # @app.route("/")
    # def index():
    #     return app.send_static_file("index.html")

    # @app.errorhandler(404)
    # def not_found(err):
    #     return app.send_static_file("index.html")

    # model (serializer)
    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "Users": Users,
            "Movies": Movies,
            "Showings": Showings,
            "Reservations": Reservations,
            "Seats": Seats
        }

    return app