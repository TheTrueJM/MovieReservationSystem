from models import UserRoles, TheatreTypes, CustomerTypes, SeatPrices



def initialise_data():
    create_user_roles({"regular", "admin"})
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
        ("senior", "premium"): 15.0,
    })



def create_user_roles(user_roles: set[str]):
    for user_role in user_roles:
        role = UserRoles(role=user_role)
        role.save()



def create_theatre_types(theatre_types: set[str]):
    for theatre_type in theatre_types:
        theatre = TheatreTypes(theatre=theatre_type)
        theatre.save()


def create_customer_types(customer_types: set[str]):
    for customer_type in customer_types:
        customer = CustomerTypes(customer=customer_type)
        customer.save()



def create_seating_prices(seat_prices: dict[(str, str): float]):
    for (customer, theatre), price in seat_prices.items():
        seat_price = SeatPrices(customer=customer, theatre=theatre, price=price)
        seat_price.save()