import { API, SITE } from "./api.js";

document.addEventListener("DOMContentLoaded", function() {
    fetchMovies();

    function fetchMovies() {
        fetch(API + "admin/movies", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
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
            movieDiv.href = `${SITE}admin/movie/${movie.id}`;

            movieDiv.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title} image">
                <div class="title">${movie.title}</div>
            `;

            movieList.appendChild(movieDiv);
        });
    }
});


const modal = document.getElementById("modal")

window.openModal=openModal;
window.cancelModal=cancelModal;

function openModal() {
    modal.showModal() 
}

function cancelModal() {
    modal.close() 
}


window.createMovie=createMovie;

function createMovie() {

}