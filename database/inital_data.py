import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

from .models import UserRoles, TheatreTypes, CustomerTypes, SeatPrices, Movies
from .models import Users
from .user_roles import DEFAULT_USER_ROLE, ADMIN_ROLE
from .tmdb_import import valid_authentication, movies_import, genres_import, get_movie_runtime



load_dotenv()



def check_env_variable_true(env_variable: str) -> bool:
    return os.getenv(env_variable, "False").lower() in {"true", "t", "1"}



def initialise_data():
    create_user_roles({DEFAULT_USER_ROLE, ADMIN_ROLE})

    if check_env_variable_true("CREATE_ADMIN"):
        if os.getenv("ADMIN_USERNAME") and os.getenv("ADMIN_PASSWORD"):
            create_admin_user(os.getenv("ADMIN_USERNAME"), os.getenv("ADMIN_PASSWORD"))
        else:
            print("!!! Enviroment Variables 'ADMIN_USERNAME' and 'ADMIN_PASSWORD' must be set to create an admin user")

    create_theatre_types({"standard", "premium"})
    create_customer_types({"child", "student", "adult", "senior"})

    create_seating_prices({
        ("child", "standard"): 10.0,
        ("student", "standard"): 12.0,
        ("adult", "standard"): 14.0,
        ("senior", "standard"): 10.0,

        ("child", "premium"): 15.0,
        ("student", "premium"): 18.0,
        ("adult", "premium"): 20.0,
        ("senior", "premium"): 15.0
    })

    if check_env_variable_true("IMPORT_TMDB_MOVIES"):
        if valid_authentication():
            import_movies_data()
        else:
            print("!!! Enviroment Variable 'TMDB_API_KEY' must be set to a valid TMDB API Ket to import movies data")



def create_user_roles(user_roles: set[str]):
    for user_role in user_roles:
        if not UserRoles.query.get(user_role):
            role = UserRoles(role=user_role)
            role.save()


def create_admin_user(admin_name: str, password: str):
    if not Users.query.filter_by(username=admin_name).first():
        admin_user = Users(username=admin_name, password=generate_password_hash(password), role=ADMIN_ROLE)
        admin_user.save()



def create_theatre_types(theatre_types: set[str]):
    for theatre_type in theatre_types:
        if not TheatreTypes.query.get(theatre_type):
            theatre = TheatreTypes(theatre=theatre_type)
            theatre.save()


def create_customer_types(customer_types: set[str]):
    for customer_type in customer_types:
        if not CustomerTypes.query.get(customer_type):
            customer = CustomerTypes(customer=customer_type)
            customer.save()


def create_seating_prices(seat_prices: dict[(str, str): float]):
    for (customer, theatre), price in seat_prices.items():
        if not SeatPrices.query.get((customer, theatre)):
            seat_price = SeatPrices(customer=customer, theatre=theatre, price=price)
            seat_price.save()


def import_movies_data():
    try:
        movies: list[dict] = movies_import()
        genres: dict[int, str] = genres_import()

        for movie in movies["results"]:
            if not Movies.query.filter_by(title=movie["title"]).first():
                genre: str = genres[movie["genre_ids"][0]] if 1 <= len(movie["genre_ids"]) else "None"
                image_url: str = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + movie["poster_path"]
                length: int = 60

                if check_env_variable_true("INCLUDE_RUNTIME"):
                    length = get_movie_runtime(movie["id"])

                new_movie = Movies(title=movie["title"], description=movie["overview"], genre=genre, image_url=image_url, length=length)
                new_movie.save()
    
    except Exception as e:
        print("!!! An error occured while importing movies data from the TMDB API")
        print(e)