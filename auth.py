from flask_restx import Resource, Namespace, fields
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required
from flask import request, jsonify, make_response, abort, Response

from models import Users
from inital_data import DEFAULT_USER_ROLE



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



def json_response(code: int, data: list | dict) -> Response:
    return make_response(jsonify(data), code)



@auth_ns.route("/signup")
class AuthSignUp(Resource):
    @auth_ns.expect(signup_model, validate=True)
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

        return json_response(201, {"message": f"User '{username}' created successfuly"})


@auth_ns.route("/login")
class AuthLogin(Resource):
    @auth_ns.expect(login_model)
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
            return json_response(200, {"access_token": access_token, "refresh_token": refresh_token})
        else:
            abort(401, "Invalid username or password")


@auth_ns.route("/refresh")
class AuthTokenRefresh(Resource):
    @jwt_required(refresh=True)
    def get(self):
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return json_response(200, {"access_token": new_access_token})