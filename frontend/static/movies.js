import { API } from "./api.js";

document.addEventListener("DOMContentLoaded", function() {
    fetchMovies();

    function fetchMovies() {
        fetch(API + "movies")
            .then(response => response.json())
            .then(data => displayMovies(data))
            .catch(error => {});
    }

    function displayMovies(movies) {
        const movieList = document.getElementById("movieList");
        movieList.innerHTML = "";

        movies.forEach(movie => {
            const movieDiv = document.createElement("a");
            movieDiv.classList.add("card");
            movieDiv.href = `http://localhost:4000/movie/${movie.id}`;

            movieDiv.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title} image">
                <div class="title">${movie.title}</div>
            `;

            movieList.appendChild(movieDiv);
        });
    }
});