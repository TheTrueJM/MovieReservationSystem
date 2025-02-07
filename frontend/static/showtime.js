const API = "http://localhost:5000/"

let selectedSeats = [];
let customerSeats = {};

document.addEventListener("DOMContentLoaded", function() {

    function fetchMovieShowtime() {
        const url = window.location.pathname;
        const id = url.split('/').pop();

        fetch(API + "movies/showtimes/" + id)
            .then(response => response.json())
            .then(data => {
                let {showtime, seat_prices} = data
                displayMovie(showtime.movie);
                displayShowtime(showtime);
                displayReservation(showtime, seat_prices);
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    function displayMovie(movie) {
        document.title += " " + movie.title

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = "";

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
        showtimeDetails.innerHTML = "";

        showtimeDetails.innerHTML = `
            <h1>${showtime.date} | ${showtime.time_start}-${showtime.time_end}</h1>
            <div>${showtime.theatre}</div>
        `;
    }

    function displayReservation(showtime, seat_prices) {
        const showtimeReservation = document.getElementById("showtimeReservation");

        displayShowtimeSeats(showtime, showtimeReservation);
        displaySeatPrices(seat_prices, showtimeReservation)

        const reservationButton = document.createElement("button");
        reservationButton.textContent = "Create Reservation";

        reservationButton.addEventListener("click", function() {
            let customers = [];
            for (const customer in customerSeats) {
                if (0 < customerSeats[customer]) {
                    for (i = 0; i < customerSeats[customer]; i++) {
                        customers.push(customer)
                    }
                }
            }

            fetch(API + "movies/showtimes/" + showtime.id, {
                method: "POST",
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
                    return response.json().then(err => { throw new Error(err.message); });
                }
            })
            .then(data => {
                console.log(data)
            })
            .catch(error => console.error("Error validating data:", error));
        });

        showtimeReservation.appendChild(reservationButton);
    }

    function displayShowtimeSeats(showtime, showtimeReservation) {
        let reserved = [];
        showtime.reservations.forEach(reservation => {
            reservation.seats.forEach(seat => {
                reserved.push(seat.seat_no)
            });
        });

        const seatSelector = document.createElement("div");
        seatSelector.id = "selection";
        showtimeReservation.appendChild(seatSelector);

        for (i = 1; i <= showtime.seats_total; i++) {
            const seatOption = document.createElement("div");
            seatOption.classList.add("option");
            seatOption.textContent = i;

            if (reserved.includes(i)) {
                seatOption.classList.add("disabled");
            } else {
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
    };

    function displaySeatPrices(seat_prices, showtimeReservation) {
        const seatPrices = document.createElement("div");
        seatPrices.id = "seatPrices";
        showtimeReservation.appendChild(seatPrices);

        seat_prices.forEach(seat_price => {
            customerSeats[seat_price.customer] = 0;

            const seatPrice = document.createElement("div");
            seatPrice.classList.add("seatPrice");

            seatPrice.innerHTML = `
                <div>${seat_price.customer}</div>
                <div>$${seat_price.price}</div>
                <div class="numberInput">
                    <button class="decrease">-</button>
                    <div class="count">0</div>
                    <button class="increase">+</button>
                </div>
            `

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

    fetchMovieShowtime();
});