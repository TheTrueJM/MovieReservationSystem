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
            showtimeDiv.classList.add("card", "flex");
            showtimeDiv.href = `${SITE}showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} image">
                <div class="details flexCol contentSpaced textCenter">
                    <div class="textBold fontLarge">${showtime.movie.title}</div>
                    <div class="textBolder fontTitle">${showtime.date} | ${showtime.time_start}</div>
                    <div class="flex contentSpaced fontRegular">
                        <div>${showtime.theatre.toUpperCase()}</div>
                        <div>${showtime.seats_available} Seats Available</div>
                    </div>
                </div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});