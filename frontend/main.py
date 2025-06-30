from flask import Flask, redirect, render_template

app = Flask(__name__)
PORT = 5500


@app.route('/')
def index():
    return redirect("/movies")


@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/movies')
def movies():
    return render_template('movies.html')

@app.route('/movies/<id>')
def movie():
    return render_template('movie.html')

@app.route('/showtimes')
def showtimes():
    return render_template('showtimes.html')

@app.route('/showtimes/<id>')
def showtime():
    return render_template('showtime.html')


@app.route('/user')
def user_settings():
    return render_template('userSettings.html')

@app.route('/user/reservations/<id>')
def user_reservations():
    return render_template('reservation.html')


@app.route('/admin/movies')
def admin_movies():
    return render_template('adminMovies.html')

@app.route('/admin/movies/<id>')
def admin_movie():
    return render_template('adminMovie.html')

@app.route('/admin/showtimes')
def admin_showtimes():
    return render_template('adminShowtimes.html')

@app.route('/admin/showtimes/<id>')
def admin_showtime():
    return render_template('adminShowtime.html')


if __name__ == '__main__':
    app.run(port=PORT)