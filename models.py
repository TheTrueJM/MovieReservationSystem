from database import db
# from user_roles import UserRole
# from customer_types import CustomerType
# from theatre_types import TheatreType
# from seating import seatingPrices



class UserRoles(db.Model):
    role = db.Column(db.String, primary_key=True) # Regular, Admin

    def save(self):
        db.session.add(self)
        db.session.commit()

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True) # Length
    password = db.Column(db.String, nullable=False) # Length, Data Type
    role = db.Column(db.String, db.ForeignKey(UserRoles.role)) # Regular, Admin

    def save(self):
        db.session.add(self)
        db.session.commit()



class Movies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False) # Length
    description = db.Column(db.String) # Length
    genre = db.Column(db.String, nullable=False) # Length, Multiple (new table)?
    image_url = db.Column(db.String, nullable=False) # URL
    length = db.Column(db.Integer, nullable=False) # Integer Minutes

    # Title, Description, Poster Image, Genre, Length, Age Rating

    def save(self):
        db.session.add(self)
        db.session.commit()



class TheatreTypes(db.Model):
    theatre = db.Column(db.String, primary_key=True) # Standard, Premium

    def save(self):
        db.session.add(self)
        db.session.commit()

class Showings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_start = db.Column(db.Time, nullable=False)
    time_end = db.Column(db.Time, nullable=False)
    seats_total = db.Column(db.Integer, nullable=False)
    seats_available = db.Column(db.Integer, nullable=False)
    theatre = db.Column(db.String, db.ForeignKey(TheatreTypes.theatre), nullable=False) # Standard, Premium

    # Movie, TimeStart, TimeEnd, SeatsAvailable
    # Standard, Premium

    def save(self):
        db.session.add(self)
        db.session.commit()



class CustomerTypes(db.Model):
    customer = db.Column(db.String, primary_key=True) # Child, Student, Adult, Senior

    def save(self):
        db.session.add(self)
        db.session.commit()

class SeatPrices(db.Model):
    customer = db.Column(db.String, db.ForeignKey(CustomerTypes.customer), primary_key=True) # Child, Student, Adult, Senior
    theatre = db.Column(db.String, db.ForeignKey(TheatreTypes.theatre), primary_key=True) # Standard, Premium
    price = db.Column(db.Float, nullable=False)

    def save(self):
        db.session.add(self)
        db.session.commit()


class Reservations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(Users.id))
    show_id = db.Column(db.Integer, db.ForeignKey(Showings.id))
    seats = db.Column(db.Integer, nullable=False, default=0)
    cost = db.Column(db.Float, nullable=False, default=0.0) # Currency

    # User, ShowTime, Seats, Cost

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def add_seat(self, customer: str):
        show = Showings.query.get(self.show_id)
        seat_prices = SeatPrices.query.get((customer, show.theatre))
        print(customer, show.theatre)

        self.seats += 1
        self.cost += seat_prices.price

class Seats(db.Model):
    reservation_id = db.Column(db.Integer, db.ForeignKey(Reservations.id), primary_key=True)
    seat_no = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String, db.ForeignKey(CustomerTypes.customer), nullable=False) # Child, Student, Adult, Senior

    # Seat Number
    # Child, Student, Adult, Senior

    def save(self):
        reservation = Reservations.query.get(self.reservation_id)
        reservation.add_seat(self.customer)

        db.session.add(self)
        db.session.commit()



# from datetime import date, time

# user = Users(username="user", password="password", role=UserRole.regular)
# movie = Movies(title="test movie", description="nothing important", genre="movie", image_url="random", length=60)
# showing = Showings(movie_id=1, date=date(2025, 1, 26), time_start=time(10, 30), time_end=time(11, 30), seats_total=50, seats_available=50, theatre=TheatreType.standard)
# reservation = Reservations(user_id=1, show_id=1)

# seats = {2: CustomerType.adult, 3: CustomerType.child, 14: CustomerType.senior}
# for seat_no in seats:
#     seat = Seats(reservation_id=reservation.id, seat_no=seat_no, customer=seats[seat_no])


# print(reservation.seats, reservation.cost)