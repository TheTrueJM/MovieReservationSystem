import { API, SITE, dateDisplay, timeDisplay } from "./exports.js";

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
            showtimeDiv.classList.add("card", "flex");
            showtimeDiv.href = `${SITE}admin/showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} image">
                <div class="details flexCol contentSpaced textCenter">
                    <div class="textBold">${showtime.movie.title}</div>
                    <div class="adminTime textBolder">${dateDisplay(showtime.date)} | ${timeDisplay(showtime.time_start)}</div>
                    <div>
                        <div class="flex contentSpaced">
                            <div>${showtime.theatre.toUpperCase()}</div>
                            <div>${showtime.seats_total - showtime.seats_available}/${showtime.seats_total} Seats Reserved</div>
                        </div>
                        <div>Current Revenue: $${showtime.revenue.toFixed(2)}</div>
                    </div>
                </div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});