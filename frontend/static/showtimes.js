import { API, SITE } from "./api.js";

document.addEventListener("DOMContentLoaded", function() {
    fetchShowtimes();

    function fetchShowtimes() {
        fetch(API + "movies/showtimes")
            .then(response => response.json())
            .then(showtimes => displayShowtimes(showtimes))
            .catch(error => {});
    }

    function displayShowtimes(showtimes) {
        const showtimeList = document.getElementById("showtimeList");
        showtimeList.innerHTML = "";

        showtimes.forEach(showtime => {
            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card");
            showtimeDiv.href = `${SITE}showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} image">
                <div class="details">
                    <div class="title">${showtime.movie.title}</div>
                    <div class="time">${showtime.date} | ${showtime.time_start}</div>
                    <div class="theatreDetails">
                        <p>${showtime.theatre.toUpperCase()}</p>
                        <p>${showtime.seats_available} Seats Available</p>
                    </div>
                </div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});