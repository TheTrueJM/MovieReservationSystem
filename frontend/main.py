from flask import Flask, redirect, render_template, abort

app = Flask(__name__)


@app.route("/")
def index():
    return redirect("/movies")


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


@app.errorhandler(401)
def unauthorised(e):
    return handle_error({
        "code": 401,
        "status": "Unauthorised Access",
        "message": "You are not authorised to access the requested resource."
    })

@app.errorhandler(404)
def not_found(e):
    return handle_error({
        "code": 404,
        "status": "Resource Not Found",
        "message": "The requested resource could not be found. It may have been moved or deleted."
    })

@app.errorhandler(500)
def internal_error(e):
    return handle_error({
        "code": 500,
        "status": "Server Error",
        "message": "An unexpected error occurred on the server. Please try again later if this issue persists."
    })

def handle_error(error: dict): # Add Status/Title?
    error.setdefault("code", 500),
    error.setdefault("status", "Server Error"),
    error.setdefault("message", "An internal server error occured")
    return render_template("error.html", error=error), error["code"]

@app.route("/error401")
def trigger_error_401():
    abort(401)

@app.route("/error404")
def trigger_error_404():
    abort(404)

@app.route("/error500")
def trigger_error_500():
    abort(500)


if __name__ == "__main__":
    app.run(port=5500)