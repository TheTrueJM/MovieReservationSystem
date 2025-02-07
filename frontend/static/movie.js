const API = "http://localhost:5000/"

document.addEventListener("DOMContentLoaded", function() {

    function fetchMovie() {
        const url = window.location.pathname;
        const id = url.split("/").pop();

        fetch(API + "movies/" + id)
            .then(response => response.json())
            .then(movie => {
                displayMovie(movie);
                displayShowtimes(movie.showtimes);
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

    function displayShowtimes(showtimes) {
        const movieAside = document.getElementById("movieAside");

        let current_date; let showtimeList;
        showtimes.forEach(showtime => { // LIST ORDERING -> Dates
            if (showtime.date != current_date) {
                current_date = showtime.date

                const showtimeDate = document.createElement("h2");
                showtimeDate.textContent = showtime.date;
                movieAside.appendChild(showtimeDate);

                showtimeList = document.createElement("div");
                showtimeList.id = "showtimeList"
                movieAside.appendChild(showtimeList);
            }

            const showtimeDiv = document.createElement("a");
            showtimeDiv.classList.add("card");
            showtimeDiv.href = `http://localhost:4000/showtime/${showtime.id}`

            showtimeDiv.innerHTML = `
                <div class="details">
                    <p>${showtime.theatre.toUpperCase()}</p>
                    <p>${showtime.seats_available} Seats Available</p>
                </div>
                <div class="time">${showtime.date} | ${showtime.time_start}</div>
            `;

            showtimeList.appendChild(showtimeDiv);
        });
    }


    fetchMovie();
});