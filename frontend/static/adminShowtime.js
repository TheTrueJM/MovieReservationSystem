import { API, SITE, toTitle, dateDisplay, timeDisplay } from "./exports.js";

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
                displayFeedback();
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    function displayMovie(movie) {
        document.title += " " + movie.title + " | Showtime";

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title} image">
            <a href="${SITE}admin/movie/${movie.id}" class="title textCenter textBold">${movie.title}</a>
            <div class="details textCenter">
                <div class="flex contentSpaced">
                    <div>${movie.length} Minutes</div>
                    <div class="textBold">${movie.genre}</div>
                </div>
                <div>Revenue: $${movie.revenue}</div>
            </div>
            <div class="description">${movie.description}</div>
        `;
    }

    function displayShowtime(showtime) {
        const showtimeDetails = document.getElementById("showtimeDetails");
        showtimeDetails.innerHTML = `
            <div id="pageTitle" class="textCenter textBold">${dateDisplay(showtime.date)} ~ ${timeDisplay(showtime.time_start)} - ${timeDisplay(showtime.time_end)}</div>
        `;
    }

    function displayReservation(showtime) {
        const showtimeReservation = document.getElementById("showtimeReservation");

        fetch(API + "movies/seatPricing?theatre=" + showtime.theatre)
            .then(response => response.json())
            .then(seat_prices => {
                displayShowtimeSeats(showtime, showtimeReservation);
                displaySeatRevenue(seat_prices, showtime, showtimeReservation)
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    function displayShowtimeSeats(showtime, showtimeReservation) {
        let reservedSeats = [];
        showtime.reservations.forEach(reservation => {
            reservation.seats.forEach(seat => {
                reservedSeats.push(seat.seat_no);
            });
        });


        const seatSelection = document.createElement("div");
        seatSelection.id = "seatSelection";
        seatSelection.classList.add("flexCol")
        showtimeReservation.appendChild(seatSelection);

        seatSelection.innerHTML = `<div class="title textCenter textBold">Showtime Theatre Seats</div>`

        const seatSelector = document.createElement("div");
        seatSelector.id = "seatSelector";
        seatSelector.classList.add("flex")
        seatSelection.appendChild(seatSelector);

        for (let i = 1; i <= showtime.seats_total; i++) {
            const seatOption = document.createElement("button");
            seatOption.textContent = i;

            if (reservedSeats.includes(i)) {
                seatOption.classList.add("disabled");
            }

            seatSelector.appendChild(seatOption);
        };
    }

    function displaySeatRevenue(seat_prices, showtime, showtimeReservation) {
        let customerCount = {};
        let customerRevenue = {};

        showtime.reservations.forEach(reservation => {
            reservation.seats.forEach(seat => {
                customerCount[seat.customer] = customerCount[seat.customer] + 1 || 1;
                customerRevenue[seat.customer]= customerRevenue[seat.customer] + seat.cost || seat.cost;
            })
        })

        const seatPrices = document.createElement("div");
        seatPrices.id = "seatPrices";
        showtimeReservation.appendChild(seatPrices);

        seatPrices.innerHTML += `<div class="title flex textBold">Customer Revenue $${showtime.revenue.toFixed(2)} - ${showtime.theatre.toUpperCase()} Theatre Experience</div>`

        seat_prices.forEach(seat_price => {
            const seatPrice = document.createElement("div");
            seatPrice.classList.add("seatPrice", "flex", "contentSpaced");

            seatPrice.innerHTML = `
                <div class="flex">
                    <div class="customer textBold">${toTitle(seat_price.customer)}</div>
                    <div class="customerCount textCenter">${customerCount[seat_price.customer] || 0}</div>
                    <div class="price">$${seat_price.price.toFixed(2)}</div>
                </div>
                <div class="revenue">$${(customerRevenue[seat_price.customer] || 0).toFixed(2)}</div>
            `;

            seatPrices.appendChild(seatPrice);
        });
    }

    function displayFeedback() {
        const movieMain = document.getElementById("movieMain");
        const feedback = document.createElement("div");
        feedback.id = "feedback"
        feedback.classList.add("feedback", "textBold");
        movieMain.appendChild(feedback)
    }
});


window.deleteShowtime=deleteShowtime;

function deleteShowtime() {
    const url = window.location.pathname;
    const id = url.split('/').pop();

    const feedback = document.getElementById("feedback");

    fetch(API + "admin/showtimes/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
    })
        .then(response => {
            if (response.ok) {
                feedback.innerHTML = "Showtime Successfully Deleted. Redirecting...";
                feedback.classList.add("feedbackSuccess")
                feedback.classList.remove("feedbackFail")
                setTimeout(() => {window.location.href = `${SITE}admin/showtimes`;}, 2500);
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


