import { API, SITE, toTitle, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    let selectedSeats = [];
    let customerSeats = {};

    fetchMovieShowtime();

    function fetchMovieShowtime() {
        const url = window.location.pathname;
        const id = url.split('/').pop();

        fetch(API + "movies/showtimes/" + id)
            .then(response => {
                if (response.ok) { return response.json(); }
                else { throw new Error(response.status); }
            })
            .then(showtime => {
                displayMovie(showtime.movie);
                displayShowtime(showtime);
                displayReservation(showtime);
            })
            .catch(error => {
                if (error.message == 404) { window.location.href = "/error404"; }
                else { window.location.href = "/error500"; }
            });
    }

    function displayMovie(movie) {
        document.title += " " + movie.title + " | Showtime Reservation";

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

    function displayShowtime(showtime) {
        const showtimeDetails = document.getElementById("showtimeDetails");
        showtimeDetails.innerHTML = `
            <div id="pageTitle">${dateDisplay(showtime.date)} ~ ${timeDisplay(showtime.time_start)} - ${timeDisplay(showtime.time_end)}</div>
        `;
    }


    function displayReservation(showtime) {
        const showtimeReservation = document.getElementById("showtimeReservation");

        fetch(API + "movies/seatPricing?theatre=" + showtime.theatre)
            .then(response => {
                if (response.ok) { return response.json(); }
                else { throw new Error(response.status); }
            })
            .then(seat_prices => {
                displayShowtimeSeats(showtime, showtimeReservation);
                displaySeatPrices(seat_prices, showtime.theatre, showtimeReservation)
                displayCreateReservation(showtime, showtimeReservation)
            })
            .catch(error => { window.location.href = "/error500"; });
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

        seatSelection.innerHTML = `<div class="title">Select Theatre Seats</div>`

        const seatSelector = document.createElement("div");
        seatSelector.id = "seatSelector";
        seatSelector.classList.add("flex")
        seatSelection.appendChild(seatSelector);

        for (let i = 1; i <= showtime.seats_total; i++) {
            const seatOption = document.createElement("button");
            seatOption.textContent = i;

            if (reservedSeats.includes(i)) {
                seatOption.classList.add("disabled")
            } else {
                seatOption.classList.add("enabled")
                seatOption.addEventListener("click", function() {
                    const optionValue = parseInt(this.textContent);
        
                    if (selectedSeats.includes(optionValue)) {
                        selectedSeats = selectedSeats.filter(option => option !== optionValue);
                        this.classList.remove("selected");
                    } else {
                        selectedSeats.push(optionValue);
                        this.classList.add("selected");
                    };
                });
            };

            seatSelector.appendChild(seatOption);
        };
    }

    function displaySeatPrices(seat_prices, theatre, showtimeReservation) {
        const seatPrices = document.createElement("div");
        seatPrices.id = "seatPrices";
        showtimeReservation.appendChild(seatPrices);

        seatPrices.innerHTML += `<div class="title flex">Customer Prices - ${theatre.toUpperCase()} Theatre Experience</div>`

        seat_prices.forEach(seat_price => {
            customerSeats[seat_price.customer] = 0;

            const seatPrice = document.createElement("div");
            seatPrice.classList.add("seatPrice", "flex", "contentSpaced");

            seatPrice.innerHTML = `
                <div class="flex">
                    <div class="customer">${toTitle(seat_price.customer)}</div>
                    <div class="price">$${seat_price.price.toFixed(2)}</div>
                </div>
                <div class="numberInput flex">
                    <button class="decrease">-</button>
                    <div class="count">0</div>
                    <button class="increase">+</button>
                </div>
            `;

            const decreaseButton = seatPrice.querySelector(".decrease");
            const increaseButton = seatPrice.querySelector(".increase");
            const countDisplay = seatPrice.querySelector(".count");

            increaseButton.addEventListener("click", function() {
                customerSeats[seat_price.customer]++;
                countDisplay.textContent = customerSeats[seat_price.customer];
            });
    
            decreaseButton.addEventListener("click", function() {
                if (0 < customerSeats[seat_price.customer]) {
                    customerSeats[seat_price.customer]--;
                    countDisplay.textContent = customerSeats[seat_price.customer];
                }
            });

            seatPrices.appendChild(seatPrice);
        });
    }

    function displayCreateReservation(showtime, showtimeReservation) {
        const reservationButton = document.createElement("button");
        reservationButton.classList.add("floatButton")
        reservationButton.textContent = "Place Reservation";

        const feedback = document.createElement("div");
        feedback.classList.add("feedback");

        reservationButton.addEventListener("click", function() {            
            let customers = [];
            for (const customer in customerSeats) {
                for (let i = 0; i < customerSeats[customer]; i++) {
                    customers.push(customer);
                }
            }

            fetch(API + "movies/showtimes/" + showtime.id, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "seats": selectedSeats,
                    "customers": customers
                })
            })
                .then(response => {
                    if (response.ok) { return response.json(); }
                    else { return response.json().then(error => { throw new Error(error.message || "Valid User Authentication is Required"); }); }
                })
                .then(reservation => {
                    feedback.innerHTML = "Reservation Successfully Created. Redirecting...";
                    feedback.classList.add("feedbackSuccess")
                    feedback.classList.remove("feedbackFail")
                    setTimeout(() => {window.location.href = `${SITE}user/reservation/${reservation.id}`;}, 2500);
                })
                .catch(error => {
                    feedback.innerHTML = error.message;
                    feedback.classList.add("feedbackFail")
                    feedback.classList.remove("feedbackSuccess")
                });
        });

        showtimeReservation.appendChild(reservationButton);
        showtimeReservation.appendChild(feedback);
    }
});