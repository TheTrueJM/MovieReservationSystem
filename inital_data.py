from models import UserRoles, TheatreTypes, CustomerTypes, SeatPrices
from models import Users

from werkzeug.security import generate_password_hash



DEFAULT_USER_ROLE: str = "regular"
ADMIN_ROLE: str = "admin"


def initialise_data():
    create_user_roles({DEFAULT_USER_ROLE, ADMIN_ROLE})
    create_admin_user("AdminUser", "TestingPass") ### 

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