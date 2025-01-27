from flask_restx import Resource, Namespace, fields
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required
from flask import request

from models import Users
from inital_data import DEFAULT_USER_ROLE
from http_responses import http_ok, http_created, http_bad_request, http_unauthorised



auth_ns = Namespace("auth", description="A namespace for Authorisation")


signup_model = auth_ns.model(
    "signup", {
        "username": fields.String(required=True),
        "password": fields.String(required=True)
    },
)


login_model = auth_ns.model(
    "login", {
        "username": fields.String(required=True),
        "password": fields.String(required=True)
    }
)



@auth_ns.route("/signup")
class SignUp(Resource):
    @auth_ns.expect(signup_model, validate=True)
    def post(self):
        data: dict = request.get_json()
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return http_bad_request("Feedback on missing values")

        if Users.query.filter_by(username=username).first():
            return http_unauthorised(f"User '{username}' already exists")

        new_user = Users(username=data.get("username"), password=generate_password_hash(password), role=DEFAULT_USER_ROLE)
        new_user.save()

        return http_created(f"User '{username}' created successfuly")


@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data: dict = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return http_bad_request("Feedback on missing values")

        db_user: Users = Users.query.filter_by(username=username).first()

        if db_user and check_password_hash(db_user.password, password):
            access_token = create_access_token(identity=db_user.username) ### expires_delta
            refresh_token = create_refresh_token(identity=db_user.username)
            return http_ok({"access_token": access_token, "refresh_token": refresh_token})
        else:
            return http_unauthorised("Invalid username or password")


@auth_ns.route("/refresh")
class RefreshResource(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return http_ok({"access_token": new_access_token})