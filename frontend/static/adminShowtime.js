import { API } from "./api.js";

let selectedSeats = [];
let customerSeats = {};

document.addEventListener("DOMContentLoaded", function () {
    fetchMovieShowtime();

    function fetchMovieShowtime() {
        const url = window.location.pathname;
        const id = url.split('/').pop();

        fetch(API + "admin/showtimes/" + id, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => response.json())
            .then(showtime => {
                displayMovie(showtime.movie);
                displayShowtime(showtime);
                displayReservation(showtime);
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    function displayMovie(movie) {
        document.title += " " + movie.title + " | Showtime";

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title} image">
            <div>${movie.title}</div>
            <div>${movie.genre}</div>
            <div>${movie.length} minutes</div>
            <div>Revenue: $${movie.revenue}</div>
            <div>${movie.description}</div>
        `;
    }

    function displayShowtime(showtime) {
        const showtimeDetails = document.getElementById("showtimeDetails");
        showtimeDetails.innerHTML = `
            <h1>${showtime.date} | ${showtime.time_start}-${showtime.time_end}</h1>
            <div>${showtime.theatre}</div>
            <div class="revenue">Current Revenue: $${showtime.revenue}</div>
        `;
    }

    function displayReservation(showtime) {
        const showtimeReservation = document.getElementById("showtimeReservation");

        let reservedSeats = [];
        showtime.reservations.forEach(reservation => {
            reservation.seats.forEach(seat => {
                reservedSeats.push(seat.seat_no);
            });
        });

        const seatSelector = document.createElement("div");
        seatSelector.id = "selection";
        showtimeReservation.appendChild(seatSelector);

        for (let i = 1; i <= showtime.seats_total; i++) {
            const seatOption = document.createElement("button");
            seatOption.textContent = i;

            if (reservedSeats.includes(i)) {
                seatOption.disabled = true;
            } // Do something for regular buttons

            seatSelector.appendChild(seatOption);
        };
    }
});