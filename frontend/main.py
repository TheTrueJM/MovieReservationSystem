from flask import Flask, redirect, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return redirect("/movies")


@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/movies")
def movies():
    return render_template("movies.html")

@app.route("/movie/<int:id>")
def movie(id: int):
    return render_template("movie.html")

@app.route("/showtimes")
def showtimes():
    return render_template("showtimes.html")

@app.route("/showtime/<int:id>")
def showtime(id: int):
    return render_template("showtime.html")


@app.route("/user")
def user_settings():
    return render_template("userSettings.html")

@app.route("/user/reservation/<int:id>")
def user_reservations(id: int):
    return render_template("reservation.html")


@app.route("/admin/movies")
def admin_movies():
    return render_template("adminMovies.html")

@app.route("/admin/movie/<int:id>")
def admin_movie(id: int):
    return render_template("adminMovie.html")

@app.route("/admin/showtimes")
def admin_showtimes():
    return render_template("adminShowtimes.html")

@app.route("/admin/showtime/<int:id>")
def admin_showtime(id: int):
    return render_template("adminShowtime.html")


if __name__ == "__main__":
    app.run(port=5500)