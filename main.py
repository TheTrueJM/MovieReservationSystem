from flask import Flask
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from jsonschema import FormatChecker

from database.sql_database import db
from database.inital_data import initialise_data
from namespace.auth import auth_ns
from namespace.admin import admin_ns
from namespace.user import user_ns
from namespace.movies import movies_ns


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)

    CORS(app)
    JWTManager(app)

    db.init_app(app)
    with app.app_context():
        db.create_all()
        initialise_data()

    api = Api(app, doc="/docs", format_checker=FormatChecker())

    api.add_namespace(auth_ns)
    api.add_namespace(movies_ns)
    api.add_namespace(admin_ns)
    api.add_namespace(user_ns)

    return app