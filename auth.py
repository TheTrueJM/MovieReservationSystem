from flask_restx import Resource, Namespace, fields
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required
from flask import request, abort

from models import Users
from user_roles import DEFAULT_USER_ROLE, ADMIN_ROLE



auth_ns = Namespace("auth", description="A namespace for User Authorisation")


signup_model = auth_ns.model(
    "signup", {
        "username": fields.String(required=True),
        "password": fields.String(required=True)
    }
)

login_model = auth_ns.model(
    "login", {
        "username": fields.String(required=True),
        "password": fields.String(required=True)
    }
)

auth_response_marshal = auth_ns.model(
    "auth_response", {
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


admin_marshal = auth_ns.model(
    "admin_status_response", {
        "admin_status": fields.Boolean(required=True)
    }
)



def retrieve_user(username: str) -> Users | None:
    return Users.query.filter_by(username=username).first()

@auth_ns.route("/signup")
class AuthSignUp(Resource):
    @auth_ns.expect(signup_model, validate=True)
    @auth_ns.marshal_with(auth_response_marshal)
    def post(self):
        data: dict = request.get_json()
        username: str = data.get("username")
        password: str = data.get("password")
        
        if not username or not password:
            abort(400, "Username and Password must be supplied")

        if 50 < len(username):
            abort(400, "Username must not be greater than 50 characters")

        if retrieve_user(username):
            abort(401, f"User '{username}' already exists")

        new_user: Users = Users(username=data.get("username"), password=generate_password_hash(password), role=DEFAULT_USER_ROLE)
        new_user.save()

        access_token = create_access_token(identity=new_user.username)
        refresh_token = create_refresh_token(identity=new_user.username)
        return {
            "message": "User sign up successful",
            "access_token": access_token, "refresh_token": refresh_token
        }, 201


@auth_ns.route("/login")
class AuthLogin(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.marshal_with(auth_response_marshal)
    def post(self):
        data: dict = request.get_json()
        username: str = data.get("username")
        password: str = data.get("password")

        if not username or not password:
            abort(400, "Username and Password must be supplied")

        db_user: Users | None = retrieve_user(username)

        if not db_user or not check_password_hash(db_user.password, password):
            abort(401, "Incorrect Username or Password supplied")
            
        access_token = create_access_token(identity=db_user.username)
        refresh_token = create_refresh_token(identity=db_user.username)
        return {
            "message": "User login successful",
            "access_token": access_token, "refresh_token": refresh_token
        }, 200


def validate_user(username: str) -> Users:
    current_user = retrieve_user(username)
    if not current_user:
        abort(400, "Invalid user authentication identity token provided")
    return current_user

@auth_ns.route("/refresh")
class AuthTokenRefresh(Resource):
    @jwt_required(refresh=True)
    @auth_ns.marshal_with(refresh_marshal)
    def get(self):
        current_user_name: str = get_jwt_identity()
        validate_user(current_user_name)
        new_access_token = create_access_token(identity=current_user_name)
        return {"access_token": new_access_token}, 200
    

@auth_ns.route("/adminStatus")
class AuthAdminStatus(Resource):
    @jwt_required()
    @auth_ns.marshal_with(admin_marshal)
    def get(self):
        current_user_name: str = get_jwt_identity()
        current_user: Users = validate_user(current_user_name)
        return {"admin_status": current_user.role == ADMIN_ROLE}, 200