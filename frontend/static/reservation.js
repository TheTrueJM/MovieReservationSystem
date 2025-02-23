import { API, SITE, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    let selectedSeats = [];
    let customerSeats = {};

    fetchReservation();

    function fetchReservation() {
        const url = window.location.pathname;
        const id = url.split('/').pop();

        fetch(API + "user/reservations/" + id, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => response.json())
            .then(reservation => {
                displayMovie(reservation.showtime.movie);
                displayShowtime(reservation.showtime);
                displayReservation(reservation, reservation.showtime);
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    function displayMovie(movie) {
        document.title += " " + movie.title + " | Showtime Reservation";

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title} image">
            <a href="${SITE}movie/${movie.id}" class="title textCenter textBold">${movie.title}</a>
            <div class="details flex contentSpaced">
                <div>${movie.length} Minutes</div>
                <div class="textBold">${movie.genre}</div>
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


    function displayReservation(reservation, showtime) {
        const showtimeReservation = document.getElementById("showtimeReservation");

        fetch(API + "movies/seatPricing?theatre=" + showtime.theatre)
            .then(response => response.json())
            .then(seat_prices => {
                displayShowtimeSeats(reservation, showtime, showtimeReservation);
                displaySeatPrices(reservation, seat_prices, showtime.theatre, showtimeReservation);
                displayUpdateReservation(reservation, showtimeReservation);
                displayCancelReservation(reservation, showtimeReservation);
                displayFeedback(showtimeReservation);
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    function displayShowtimeSeats(reservation, showtime, showtimeReservation) {
        let reservedSeats = [];
        showtime.reservations.forEach(reservation => {
            reservation.seats.forEach(seat => {
                reservedSeats.push(seat.seat_no);
            });
        });

        reservation.seats.forEach(seat => {
            selectedSeats.push(seat.seat_no);
            reservedSeats = reservedSeats.filter(seat_no => seat_no !== seat.seat_no);
        })

        const seatSelection = document.createElement("div");
        seatSelection.id = "seatSelection";
        seatSelection.classList.add("flexCol")
        showtimeReservation.appendChild(seatSelection);

        seatSelection.innerHTML = `<div class="title textCenter textBold">Select Theatre Seats</div>`

        const seatSelector = document.createElement("div");
        seatSelector.id = "seatSelector";
        seatSelector.classList.add("flex")
        seatSelection.appendChild(seatSelector);

        for (let i = 1; i <= showtime.seats_total; i++) {
            const seatOption = document.createElement("button");
            seatOption.classList.add("textBold")
            seatOption.textContent = i;

            if (reservedSeats.includes(i)) {
                seatOption.classList.add("disabled")
            } else {
                if (selectedSeats.includes(i)) {
                    seatOption.classList.add("selected");
                }

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

    function displaySeatPrices(reservation, seat_prices, theatre, showtimeReservation) {
        reservation.seats.forEach(seat => {
            customerSeats[seat.customer] = customerSeats[seat.customer] + 1 || 1;
        })

        const seatPrices = document.createElement("div");
        seatPrices.id = "seatPrices";
        showtimeReservation.appendChild(seatPrices);

        seatPrices.innerHTML += `<div class="title flex textBold">Customer Prices - ${theatre.toUpperCase()} Theatre Experience</div>`

        seat_prices.forEach(seat_price => {
            customerSeats[seat_price.customer] = customerSeats[seat_price.customer] || 0;

            const seatPrice = document.createElement("div");
            seatPrice.classList.add("seatPrice", "flex", "contentSpaced");

            seatPrice.innerHTML = `
                <div class="flex">
                    <div class="customer textBold">${seat_price.customer[0].toUpperCase() + seat_price.customer.slice(1)}</div>
                    <div class="price">$${seat_price.price.toFixed(2)}</div>
                </div>
                <div class="numberInput flex textBolder">
                    <button class="decrease">-</button>
                    <div class="count textCenter">${customerSeats[seat_price.customer]}</div>
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

    function displayUpdateReservation(reservation, showtimeReservation) {
        const updateButton = document.createElement("button");
        updateButton.classList.add("reservationButton")
        updateButton.textContent = "Update Reservation";

        updateButton.addEventListener("click", function() {
            const feedback = document.getElementById("feedback");

            let customers = [];
            for (const customer in customerSeats) {
                for (let i = 0; i < customerSeats[customer]; i++) {
                    customers.push(customer);
                }
            }

            fetch(API + "user/reservations/" + reservation.id, {
                method: "PUT",
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
                    if (response.ok) {
                        return response.json();
                    } else {
                        return response.json().then(error => { throw new Error(error.message || "Invalid User Authorisation"); });
                    }
                })
                .then(reservation => {
                    feedback.innerHTML = "Reservation Successfully Updated. Reloading...";
                    feedback.classList.add("feedbackSuccess")
                    feedback.classList.remove("feedbackFail")
                    setTimeout(() => {location.reload();}, 2500);
                })
                .catch(error => {
                    feedback.innerHTML = error.message;
                    feedback.classList.add("feedbackFail")
                    feedback.classList.remove("feedbackSuccess")
                });
        });

        showtimeReservation.appendChild(updateButton);
    }

    function displayCancelReservation(reservation, showtimeReservation) {
        const cancelButton = document.createElement("button");
        cancelButton.classList.add("reservationButton")
        cancelButton.textContent = "Cancel Reservation";

        cancelButton.addEventListener("click", function() {
            const feedback = document.getElementById("feedback");

            fetch(API + "user/reservations/" + reservation.id, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        feedback.innerHTML = "Reservation Successfully Canceled. Redirecting...";
                        feedback.classList.add("feedbackSuccess")
                        feedback.classList.remove("feedbackFail")
                        setTimeout(() => {window.location.href = `${SITE}`;}, 2500);
                    } else {
                        return response.json().then(error => { throw new Error(error.message || "Invalid User Authorisation"); });
                    }
                })
                .catch(error => {
                    feedback.innerHTML = error.message;
                    feedback.classList.add("feedbackFail")
                    feedback.classList.remove("feedbackSuccess")
                });
        });

        showtimeReservation.appendChild(cancelButton);
    }

    function displayFeedback(showtimeReservation) {
        const feedback = document.createElement("div");
        feedback.id = "feedback"
        feedback.classList.add("feedback", "textBold");
        showtimeReservation.appendChild(feedback)
    }
});