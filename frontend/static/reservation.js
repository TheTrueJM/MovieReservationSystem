import { API } from "./api.js";

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
                console.log(reservation)
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
            <div>${movie.title}</div>
            <div>${movie.genre}</div>
            <div>${movie.length} minutes</div>
            <div>${movie.description}</div>
        `;
    }

    function displayShowtime(showtime) {
        const showtimeDetails = document.getElementById("showtimeDetails");
        showtimeDetails.innerHTML = `
            <h1>${showtime.date} | ${showtime.time_start}-${showtime.time_end}</h1>
            <div>${showtime.theatre}</div>
        `;
    }

    function displayReservation(reservation, showtime) {
        const showtimeReservation = document.getElementById("showtimeReservation");

        displayShowtimeSeats(reservation, showtime, showtimeReservation);
        fetch(API + "movies/seatPricing?theatre=" + showtime.theatre)
            .then(response => response.json())
            .then(seat_prices => {
                displaySeatPrices(reservation, seat_prices, showtimeReservation)
            })
            .catch(error => console.error("Error fetching data:", error));


        const reservationButton = document.createElement("button");
        reservationButton.textContent = "Create Reservation";

        reservationButton.addEventListener("click", function() {
            let customers = [];
            for (const customer in customerSeats) {
                for (let i = 0; i < customerSeats[customer]; i++) {
                    customers.push(customer);
                }
            }

            fetch(API + "user/reservations/" + showtime.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
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
                        return response.json().then(error => { throw new Error(error.message); });
                    }
                })
                .then(data => {
                    // location.reload();
                    console.log(data);
                })
                .catch(error => {});
        });

        showtimeReservation.appendChild(reservationButton);
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

        const seatSelector = document.createElement("div");
        seatSelector.id = "selection";
        showtimeReservation.appendChild(seatSelector);

        for (let i = 1; i <= showtime.seats_total; i++) {
            const seatOption = document.createElement("button");
            seatOption.textContent = i;

            if (reservedSeats.includes(i)) {
                seatOption.disabled = true;
            } else {
                if (selectedSeats.includes(i)) {
                    seatOption.classList.add("selected");
                }

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

    function displaySeatPrices(reservation, seat_prices, showtimeReservation) {
        reservation.seats.forEach(seat => {
            customerSeats[seat.customer] = customerSeats[seat.customer] + 1 || 1;
        })

        const seatPrices = document.createElement("div");
        seatPrices.id = "seatPrices";
        showtimeReservation.appendChild(seatPrices);

        seat_prices.forEach(seat_price => {
            customerSeats[seat_price.customer] = customerSeats[seat_price.customer] || 0;

            const seatPrice = document.createElement("div");
            seatPrice.classList.add("seatPrice");

            seatPrice.innerHTML = `
                <div>${seat_price.customer}</div>
                <div>$${seat_price.price}</div>
                <div class="numberInput">
                    <button class="decrease">-</button>
                    <div class="count">${customerSeats[seat_price.customer]}</div>
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
});