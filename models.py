from database import db

### Implement Relationships, Cascading, and Value Derivations

class UserRoles(db.Model):
    role = db.Column(db.String, primary_key=True)

    def save(self):
        db.session.add(self)
        db.session.commit()

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True) # Length
    password = db.Column(db.String, nullable=False) # Length, Data Type
    role = db.Column(db.String, db.ForeignKey(UserRoles.role), nullable=False)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, username: str, password: str):
        self.username = username
        self.password = password
        db.session.commit()

    def change_role(self, role: str):
        self.role = role
        db.session.commit()



class Movies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False) # Length
    description = db.Column(db.String) # Length
    genre = db.Column(db.String, nullable=False) # Length, Multiple (new table)?
    image_url = db.Column(db.String, nullable=False) # URL
    length = db.Column(db.Integer, nullable=False) # Integer Minutes, Min Value?
    revenue = db.Column(db.Float, nullable=False, default=0.0)
    showtimes = db.relationship("ShowTimes", backref="movies", cascade="all, delete")

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, title: str, description: str, genre: str, image_url: str, length: int):
        self.title = title
        self.description = description
        self.genre = genre
        self.image_url = image_url
        if not self.showtimes:
            self.length = length
        db.session.commit()

    def update_revenue(self):
        self.revenue = sum(showtime.revenue for showtime in self.showtimes)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()



class TheatreTypes(db.Model):
    theatre = db.Column(db.String, primary_key=True)

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
    seats_available = db.Column(db.Integer, nullable=False)
    theatre = db.Column(db.String, db.ForeignKey(TheatreTypes.theatre), nullable=False)
    revenue = db.Column(db.Float, nullable=False, default=0.0)
    reservations = db.relationship("Reservations", backref="showtimes")

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update_seat_availability(self):
        self.seats_available = self.seats_total - sum(len(reservation.seats) for reservation in self.reservations)
        db.session.commit()

    def update_revenue(self):
        self.revenue = sum(reservation.cost for reservation in self.reservations)
        db.session.commit()

        movie: Movies = Movies.query.get(self.movie_id)
        movie.update_revenue()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

        movie: Movies = Movies.query.get(self.movie_id)
        movie.update_revenue()


class CustomerTypes(db.Model):
    customer = db.Column(db.String, primary_key=True)

    def save(self):
        db.session.add(self)
        db.session.commit()

class SeatPrices(db.Model):
    customer = db.Column(db.String, db.ForeignKey(CustomerTypes.customer), primary_key=True)
    theatre = db.Column(db.String, db.ForeignKey(TheatreTypes.theatre), primary_key=True)
    price = db.Column(db.Float, nullable=False)

    def save(self):
        db.session.add(self)
        db.session.commit()


class Reservations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(Users.id), nullable=False)
    show_id = db.Column(db.Integer, db.ForeignKey(ShowTimes.id), nullable=False)
    cost = db.Column(db.Float, nullable=False, default=0.0)
    seats = db.relationship("Seats", backref="reservations", cascade="all, delete")

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update_cost(self):
        self.cost = sum(seat.cost for seat in self.seats)
        db.session.commit()
        
        showtime: ShowTimes = ShowTimes.query.get(self.show_id)
        showtime.update_revenue()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

        showtime: ShowTimes = ShowTimes.query.get(self.show_id)
        showtime.update_revenue()
        showtime.update_seat_availability()

class Seats(db.Model):
    reservation_id = db.Column(db.Integer, db.ForeignKey(Reservations.id), primary_key=True)
    seat_no = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String, db.ForeignKey(CustomerTypes.customer), nullable=False)
    cost = db.Column(db.Float, nullable=False, default=0.0)

    def save(self):
        reservation: Reservations = Reservations.query.get(self.reservation_id)
        showtime: ShowTimes = ShowTimes.query.get(reservation.show_id)

        self.cost = SeatPrices.query.get((self.customer, showtime.theatre)).price
        db.session.add(self)
        db.session.commit()
        
        reservation.update_cost()
        showtime.update_seat_availability()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

        reservation: Reservations = Reservations.query.get(self.reservation_id)
        reservation.update_cost()
        showtime: ShowTimes = ShowTimes.query.get(reservation.show_id)
        showtime.update_seat_availability()