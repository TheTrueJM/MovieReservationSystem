import { API, SITE } from "./api.js";

document.addEventListener("DOMContentLoaded", function() {
    fetchShowtimes();

    function fetchShowtimes() {
        fetch(API + "admin/showtimes", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => response.json())
            .then(showtimes => displayShowtimes(showtimes))
            .catch(error => {});
    }

    function displayShowtimes(showtimes) {
        console.log(showtimes)
        const showtimeList = document.getElementById("showtimeList");
        showtimeList.innerHTML = "";

        showtimes.forEach(showtime => {
            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card");
            showtimeDiv.href = `${SITE}admin/showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} image">
                <div class="details">
                    <div class="title">${showtime.movie.title}</div>
                    <div class="time">${showtime.date} | ${showtime.time_start}</div>
                    <div>
                        <div class="theatreDetails">
                            <p>${showtime.theatre.toUpperCase()}</p>
                            <p>${showtime.seats_total - showtime.seats_available}/${showtime.seats_total} Seats Reserved</p>
                        </div>
                        <div class="revenue">Current Revenue: $${showtime.revenue}</div>
                    </div>
                </div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});