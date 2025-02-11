import { API, SITE } from "./api.js";

document.addEventListener("DOMContentLoaded", function() {
    fetchMovies();

    function fetchMovies() {
        fetch(API + "movies")
            .then(response => response.json())
            .then(movies => displayMovies(movies))
            .catch(error => {});
    }

    function displayMovies(movies) {
        const movieList = document.getElementById("movieList");
        movieList.innerHTML = "";

        movies.forEach(movie => {
            const movieDiv = document.createElement("a");
            movieDiv.classList.add("card", "flexCol");
            movieDiv.href = `${SITE}movie/${movie.id}`;

            movieDiv.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title} image">
                <div class="title textCenter textBold fontSmall">${movie.title}</div>
            `;

            movieList.appendChild(movieDiv);
        });
    }
});