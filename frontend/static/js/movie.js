import { API, SITE, toTitle, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchMovie();

    function fetchMovie() {
        const url = window.location.pathname;
        const id = url.split("/").pop();

        fetch(API + "movies/" + id)
            .then(response => response.json())
            .then(movie => {
                displayMovie(movie);
                displayShowtimes(movie.showtimes);
            })
            .catch(error => { });
    }

    function displayMovie(movie) {
        document.title += " " + movie.title;
        
        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title} Poster">
            <a href="${SITE}movie/${movie.id}" class="title">${movie.title}</a>
            <div class="details flex contentSpaced">
                <div>${movie.length} Minutes</div>
                <div>${toTitle(movie.genre)}</div>
            </div>
            <div class="description">${movie.description}</div>
        `;
    }

    function displayShowtimes(showtimes) {
        const movieMain = document.getElementById("movieMain");

        let current_date; let showtimeList;
        showtimes.forEach(showtime => {
            if (showtime.date != current_date) {
                current_date = showtime.date;

                movieMain.innerHTML += `<div class="date">${dateDisplay(current_date)}</div>`;

                showtimeList = document.createElement("div");
                showtimeList.classList.add("showtimeList", "flex")
                movieMain.appendChild(showtimeList);
            }

            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card", "flexCol");
            showtimeDiv.href = `${SITE}showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <div class="details flex contentSpaced">
                    <div>${showtime.theatre.toUpperCase()}</div>
                    <div>${showtime.seats_available} Seats Available</div>
                </div>
                <div class="time textCenter textBold">${timeDisplay(showtime.time_start)} - ${timeDisplay(showtime.time_end)}</div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});