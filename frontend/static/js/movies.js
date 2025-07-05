import { API, SITE } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    selectNav();
    fetchMovies();

    function selectNav() {
        const linksDiv = document.getElementById("links");
        const moviesDiv = linksDiv.querySelector(".movies");
        moviesDiv.classList.add("selected");
    }

    function fetchMovies() {
        fetch(API + "movies")
            .then(response => {
                if (response.ok) { return response.json(); }
                else { throw new Error(response.status); }
            })
            .then(movies => displayMovies(movies))
            .catch(error => { window.location.href = "/error500"; });
    }

    function displayMovies(movies) {
        const movieList = document.getElementById("movieList");

        movies.forEach(movie => {
            const movieDiv = document.createElement("a");
            movieDiv.classList.add("card", "flexCol");
            movieDiv.href = `${SITE}movie/${movie.id}`;

            movieDiv.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title} Poster">
                <div class="title">${movie.title}</div>
            `;

            movieList.appendChild(movieDiv);
        });
    }
});