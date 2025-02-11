import { API, SITE } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchMovie(); // Edit Date and Time Displays

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
            })
            .catch(error => { });
    }

    function displayMovie(movie) {
        document.title += " " + movie.title;

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title} image">
            <div class="textCenter textBold fontTitle">${movie.title}</div>
            <div class="details flex fontLarge">
                <div>${movie.length} Minutes</div>
                <div class="textBold">${movie.genre}</div>
            </div>
            <div class="description">${movie.description}</div>
        `;
    }

    function displayShowtimes(showtimes) {
        const movieAside = document.getElementById("movieMain");

        let current_date; let showtimeList;
        showtimes.forEach(showtime => { // LIST ORDERING -> Dates
            if (showtime.date != current_date) {
                current_date = showtime.date;

                movieAside.innerHTML += `<h2>${showtime.date}</h2>`;

                showtimeList = document.createElement("div");
                showtimeList.classList.add("flex", "flexWrap")
                showtimeList.id = "showtimeList";
                movieAside.appendChild(showtimeList);
            }

            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card");
            showtimeDiv.href = `${SITE}admin/showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <div class="details">
                    <p>${showtime.theatre.toUpperCase()}</p>
                    <p>${showtime.seats_total - showtime.seats_available}/${showtime.seats_total} Seats Reserved</p>
                </div>
                <div class="time">${showtime.date} | ${showtime.time_start}</div>
                <div class="revenue">Current Revenue: $${showtime.revenue}</div>
            `; // Current vs Total Revenue for Showtime Dates

            showtimeList.appendChild(showtimeDiv);
        });
    }
});


const modal = document.getElementById("modal");

window.openModal=openModal;
window.cancelModal=cancelModal;

function openModal() {
    modal.showModal();
}

function cancelModal() {
    modal.close();
}


window.createShowtime=createShowtime;

function createShowtime() {
    const url = window.location.pathname;
    const id = parseInt(url.split("/").pop());

    const date = document.getElementById("date").value;
    const timeStart = document.getElementById("startTime").value + ":00";
    const timeEnd = document.getElementById("endTime").value + ":00";
    const seatsTotal = parseInt(document.getElementById("totalSeats").value);
    const theatre = document.getElementById("theatre").value;

    // // Validate Variables

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
            "time_end": timeEnd,
            "seats_total": seatsTotal,
            "theatre": theatre
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => { throw new Error(error.message); });
            }
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {});
}


window.deleteMovie=deleteMovie;

function deleteMovie() {
    const url = window.location.pathname;
    const id = url.split('/').pop();

    fetch(API + "admin/movies/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
    })
        .then(response => console.log(response))
        .catch(error => console.error("Error fetching data:", error));
}