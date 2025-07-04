import { API, SITE, toTitle, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchMovie();

    function fetchMovie() {
        const url = window.location.pathname;
        const id = url.split("/").pop();

        fetch(API + "admin/movies/" + id, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => response.json())
            .then(movie => {
                displayMovie(movie);
                displayShowtimes(movie.showtimes);
                fetchTheatreOptions();
            })
            .catch(error => {});
    }

    function displayMovie(movie) {
        document.title += " " + movie.title;

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML += `
            <img src="${movie.image_url}" alt="${movie.title} Poster">
            <a href="${SITE}admin/movie/${movie.id}" class="title">${movie.title}</a>
            <div class="details">
                <div class="flex contentSpaced">
                    <div>${movie.length} Minutes</div>
                    <div>${toTitle(movie.genre)}</div>
                </div>
                <div>Revenue: $${movie.revenue.toFixed(2)}</div>
            </div>
            <div id="movieFeedback" class="feedback"></div>
            <div class="description">${movie.description}</div>
        `;
    }

    function displayShowtimes(showtimes) {
        const movieAside = document.getElementById("movieMain");

        let current_date; let showtimeList;
        let checkDate = true;
        const currentDate = new Date();
        let revenuePhrase = "Total";
        showtimes.forEach(showtime => {
            if (checkDate && currentDate < new Date(showtime.date)) {
                checkDate = false;
                revenuePhrase = "Current";
            }

            if (showtime.date != current_date) {
                current_date = showtime.date;

                movieAside.innerHTML += `<div class="date textBold">${dateDisplay(current_date)}</div>`;

                showtimeList = document.createElement("div");
                showtimeList.classList.add("showtimeList", "flex")
                movieAside.appendChild(showtimeList);
            }

            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card", "flexCol");
            showtimeDiv.href = `${SITE}admin/showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <div class="details">
                    <div class="flex contentSpaced">
                        <div>${showtime.theatre.toUpperCase()}</div>
                        <div>${showtime.seats_total - showtime.seats_available}/${showtime.seats_total} Seats Reserved</div>
                    </div>
                    <div>${revenuePhrase} Revenue: $${showtime.revenue.toFixed(2)}</div>
                </div>
                <div class="time textCenter textBold">${timeDisplay(showtime.time_start)} - ${timeDisplay(showtime.time_end)}</div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }

    function fetchTheatreOptions() {
        fetch(API + "movies/theatres")
            .then(response => response.json())
            .then(theatres => {
                const theatreSelector = document.getElementById("theatre");
                theatres.forEach(theatre => {
                    theatreSelector.innerHTML += `<option value="${theatre.theatre}">${theatre.theatre.toUpperCase()}</option>`;
                });
            })
            .catch(error => {});
    }
});


const showtimeModal = document.getElementById("showtimeModal");

window.openModal=openModal;
window.cancelModal=cancelModal;

function openModal() {
    showtimeModal.showModal();
}

function cancelModal() {
    showtimeModal.close();
}


window.createShowtime=createShowtime;

function createShowtime() {
    const url = window.location.pathname;
    const id = parseInt(url.split("/").pop());

    const date = document.getElementById("date").value;
    const timeStart = document.getElementById("startTime").value + ":00";
    const seatsTotal = parseInt(document.getElementById("totalSeats").value);
    const theatre = document.getElementById("theatre").value;

    const feedback = document.getElementById("showtimeFeedback");

    fetch(API + "admin/showtimes", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "movie_id": id,
            "date": date,
            "time_start": timeStart,
            "seats_total": seatsTotal,
            "theatre": theatre
        })
    })
        .then(response => {
            if (response.ok) {
                console.log(response)
                return response.json();
            } else {
                return response.json().then(error => { throw new Error(error.message || "Invalid Admin User Authorisation"); });
            }
        })
        .then(showtime => {
            feedback.innerHTML = "Showtime Successfully Created. Redirecting...";
            feedback.classList.add("feedbackSuccess")
            feedback.classList.remove("feedbackFail")
            setTimeout(() => {window.location.href = `${SITE}admin/showtime/${showtime.id}`;}, 2500);
        })
        .catch(error => {
            feedback.innerHTML = error.message;
            feedback.classList.add("feedbackFail")
            feedback.classList.remove("feedbackSuccess")
        });
}


window.deleteMovie=deleteMovie;

function deleteMovie() {
    const url = window.location.pathname;
    const id = url.split('/').pop();

    const feedback = document.getElementById("movieFeedback");

    fetch(API + "admin/movies/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
    })
        .then(response => {
            if (response.ok) {
                feedback.innerHTML = "Movie Successfully Deleted. Redirecting...";
                feedback.classList.add("feedbackSuccess")
                feedback.classList.remove("feedbackFail")
                setTimeout(() => {window.location.href = `${SITE}admin/movies`;}, 2500);
            } else {
                return response.json().then(error => { throw new Error(error.message || "Invalid Admin User Authorisation"); });
            }
        })
        .catch(error => {
            feedback.innerHTML = error.message;
            feedback.classList.add("feedbackFail")
            feedback.classList.remove("feedbackSuccess")
        });
}