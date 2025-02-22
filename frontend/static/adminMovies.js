import { API, SITE } from "./exports.js";

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
            movieDiv.classList.add("card", "flexCol");
            movieDiv.href = `${SITE}admin/movie/${movie.id}`;

            movieDiv.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title} image">
                <div class="title  textCenter textBold">${movie.title}</div>
            `;

            movieList.appendChild(movieDiv);
        });
    }
});


const modal = document.getElementById("modal");

window.openModal=openModal;
window.cancelModal=cancelModal;

function openModal() {
    modal.showModal();
}

function cancelModal() {
    modal.close();
}


window.createMovie=createMovie;

function createMovie() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const genre = document.getElementById("genre").value;
    const image = document.getElementById("image").value;
    const length = parseInt(document.getElementById("length").value) || 0;

    const feedback = document.getElementById("feedback");

    fetch(API + "admin/movies", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "title": title,
            "description": description,
            "genre": genre,
            "image_url": image,
            "length": length
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => { throw new Error(error.message || "Invalid Admin User Authorisation"); });
            }
        })
        .then(movie => {
            feedback.innerHTML = "Movie Successfully Created. Redirecting...";
            feedback.classList.add("feedbackSuccess")
            feedback.classList.remove("feedbackFail")
            setTimeout(() => {window.location.href = `${SITE}admin/movie/${movie.id}`;}, 2500);
        })
        .catch(error => {
            feedback.innerHTML = error.message;
            feedback.classList.add("feedbackFail")
            feedback.classList.remove("feedbackSuccess")
        });
}