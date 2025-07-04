import { API, SITE, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    selectNav()
    fetchShowtimes();

    function selectNav() {
        const linksDiv = document.getElementById("links");
        const showtimesDiv = linksDiv.querySelector(".showtimes");
        showtimesDiv.classList.add("selected");
    }

    function fetchShowtimes() {
        fetch(API + "movies/showtimes")
            .then(response => response.json())
            .then(showtimes => displayShowtimes(showtimes))
            .catch(error => {});
    }

    function displayShowtimes(showtimes) {
        const showtimeList = document.getElementById("showtimeList");

        showtimes.forEach(showtime => {
            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card", "flex");
            showtimeDiv.href = `${SITE}showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} Poster">
                <div class="details flexCol contentSpaced">
                    <div>${showtime.movie.title}</div>
                    <div class="time">${dateDisplay(showtime.date)} | ${timeDisplay(showtime.time_start)}</div>
                    <div class="theatre flex contentSpaced">
                        <div>${showtime.theatre.toUpperCase()}</div>
                        <div>${showtime.seats_available} Seats Available</div>
                    </div>
                </div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});