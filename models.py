from database import db

### Implement Relationships, Cascading, and Value Derivations

class UserRoles(db.Model):
    role = db.Column(db.String, primary_key=True) # Regular, Admin

    def save(self):
        db.session.add(self)
        db.session.commit()

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True) # Length
    password = db.Column(db.String, nullable=False) # Length, Data Type
    role = db.Column(db.String, db.ForeignKey(UserRoles.role), nullable=False) # Regular, Admin

    def save(self):
        db.session.add(self)
        db.session.commit()



class Movies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False) # Length
    description = db.Column(db.String) # Length
    genre = db.Column(db.String, nullable=False) # Length, Multiple (new table)?
    image_url = db.Column(db.String, nullable=False) # URL
    length = db.Column(db.Integer, nullable=False) # Integer Minutes, Min Value?
    showtimes = db.relationship("ShowTimes", backref="movies") # cascade

    # Title, Description, Poster Image, Genre, Length, Age Rating

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, title: str, description: str, genre: str, image_url: str, length: int):
        self.title = title
        self.description = description
        self.genre = genre
        self.image_url = image_url
        self.length = length
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()



class TheatreTypes(db.Model):
    theatre = db.Column(db.String, primary_key=True) # Standard, Premium

    def save(self):
        db.session.add(self)
        db.session.commit()

class ShowTimes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey(Movies.id), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_start = db.Column(db.Time, nullable=False) # Time High Constraint?
    time_end = db.Column(db.Time, nullable=False) # Time Low Constraint?
    seats_total = db.Column(db.Integer, nullable=False) # Max Value?
    seats_available = db.Column(db.Integer, nullable=False) # Max Value?, Value Calculation?
    theatre = db.Column(db.String, db.ForeignKey(TheatreTypes.theatre), nullable=False) # Standard, Premium
    reservations = db.relationship("Reservations", backref="showtimes") # cascade

    def save(self):
        db.session.add(self)
        db.session.commit()

    def remove_seat(self):
        self.seats_available -= 1

    def delete(self):
        db.session.delete(self)
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
    user_id = db.Column(db.Integer, db.ForeignKey(Users.id), nullable=False)
    show_id = db.Column(db.Integer, db.ForeignKey(ShowTimes.id), nullable=False)
    # seats = db.Column(db.Integer, nullable=False, default=0) # Value Calculation?
    cost = db.Column(db.Float, nullable=False, default=0.0) # Currency, Value Calculation?
    seats = db.relationship("Seats", backref="reservations") # cascade

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def add_seat(self, customer: str):
        show: ShowTimes = ShowTimes.query.get(self.show_id)
        show.remove_seat()
        seat_prices: SeatPrices = SeatPrices.query.get((customer, show.theatre))
        self.cost += seat_prices.price
        # self.seats += 1

class Seats(db.Model):
    reservation_id = db.Column(db.Integer, db.ForeignKey(Reservations.id), primary_key=True)
    seat_no = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String, db.ForeignKey(CustomerTypes.customer), nullable=False) # Child, Student, Adult, Senior

    def save(self):
        reservation: Reservations = Reservations.query.get(self.reservation_id)
        reservation.add_seat(self.customer)

        db.session.add(self)
        db.session.commit()