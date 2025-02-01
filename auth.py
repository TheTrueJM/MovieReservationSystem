from flask_restx import Resource, Namespace, fields
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required
from flask import request, abort

from models import Users
from inital_data import DEFAULT_USER_ROLE



auth_ns = Namespace("auth", description="A namespace for Authorisation")


signup_model = auth_ns.model(
    "signup", {
        "username": fields.String(required=True),
        "password": fields.String(required=True)
    }
)

signup_marshal = auth_ns.model(
    "signup_response", {
        "message": fields.String(required=True)
    }
)


login_model = auth_ns.model(
    "login", {
        "username": fields.String(required=True),
        "password": fields.String(required=True)
    }
)

login_marshal = auth_ns.model(
    "login_response", {
        "message": fields.String(required=True),
        "access_token": fields.String(required=True),
        "refresh_token": fields.String(required=True)
    }
)


refresh_marshal = auth_ns.model(
    "refresh_response", {
        "access_token": fields.String(required=True)
    }
)


@auth_ns.route("/signup")
class AuthSignUp(Resource):
    @auth_ns.expect(signup_model, validate=True)
    @auth_ns.marshal_with(signup_marshal)
    def post(self):
        data: dict = request.get_json()
        username: str = data.get("username")
        password: str = data.get("password")
        
        if not username or not password:
            abort(400, "Feedback on missing values")

        if Users.query.filter_by(username=username).first():
            abort(401, f"User '{username}' already exists")

        new_user: Users = Users(username=data.get("username"), password=generate_password_hash(password), role=DEFAULT_USER_ROLE)
        new_user.save()

        return {"message": f"User '{username}' created successfuly"}, 201


@auth_ns.route("/login")
class AuthLogin(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.marshal_with(login_marshal)
    def post(self):
        data: dict = request.get_json()
        username: str = data.get("username")
        password: str = data.get("password")

        if not username or not password:
            abort(400, "Feedback on missing values")

        db_user: Users | None = Users.query.filter_by(username=username).first()

        if isinstance(db_user, Users) and check_password_hash(db_user.password, password):
            access_token = create_access_token(identity=db_user.username) ### expires_delta
            refresh_token = create_refresh_token(identity=db_user.username)
            return {
                "message": "Login successful",
                "access_token": access_token, "refresh_token": refresh_token
            }, 200
        else:
            abort(401, "Invalid username or password")


@auth_ns.route("/refresh")
class AuthTokenRefresh(Resource):
    @jwt_required(refresh=True)
    @auth_ns.marshal_with(refresh_marshal)
    def get(self):
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return {"access_token": new_access_token}, 200