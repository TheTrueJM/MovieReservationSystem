import { API, SITE, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    selectNav()
    fetchShowtimes();

    function selectNav() {
        const linksDiv = document.getElementById("links");
        const adminShowtimesDiv = linksDiv.querySelector(".adminShowtimes");
        adminShowtimesDiv.classList.add("selected");
    }

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


        let checkDate = true;
        const currentDate = new Date();
        let revenuePhrase = "Current";
        showtimes.forEach(showtime => {
            if (checkDate && new Date(showtime.date) <= currentDate) {
                checkDate = false;
                revenuePhrase = "Total";
            }

            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card", "flex");
            showtimeDiv.href = `${SITE}admin/showtime/${showtime.id}`;

            showtimeDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} Poster">
                <div class="details flexCol contentSpaced">
                    <div>${showtime.movie.title}</div>
                    <div class="time">${dateDisplay(showtime.date)} | ${timeDisplay(showtime.time_start)}</div>
                    <div class="theatre">
                        <div class="flex contentSpaced">
                            <div>${showtime.theatre.toUpperCase()}</div>
                            <div>${showtime.seats_total - showtime.seats_available}/${showtime.seats_total} Seats Reserved</div>
                        </div>
                        <div>${revenuePhrase} Revenue: $${showtime.revenue.toFixed(2)}</div>
                    </div>
                </div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }
});