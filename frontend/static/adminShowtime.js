import { API, SITE } from "./api.js";

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
        document.title += " " + movie.title;

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title} image">
            <a href="${SITE}admin/movie/${movie.id}" class="title textCenter textBold fontTitle">${movie.title}</a>
            <div class="details flex fontLarge">
                <div>${movie.length} Minutes</div>
                <div class="textBold">${movie.genre}</div>
            </div>
            <div class="description">${movie.description}</div>
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


window.deleteShowtime=deleteShowtime;

function deleteShowtime() {
    const url = window.location.pathname;
    const id = url.split('/').pop();

    fetch(API + "admin/showtimes/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
    })
        .then(response => console.log(response))
        .catch(error => console.error("Error fetching data:", error));
}