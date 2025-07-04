import { API } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    checkAuth();

    function checkAuth() {
        fetch(API + "auth/refresh", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("refresh_token")}`
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(data => {
                localStorage.setItem("access_token", data.access_token);

                const userDiv = document.getElementById("user");
                const unauthDivs = userDiv.querySelectorAll(".unauth");
                const authDivs = userDiv.querySelectorAll(".auth");

                unauthDivs.forEach(unauthDiv => { unauthDiv.hidden = true; });
                authDivs.forEach(authDiv => { authDiv.hidden = false; });

                checkAdmin();
            })
            .catch(error => {});
    }

    function checkAdmin() {
        fetch(API + "auth/adminStatus", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.admin_status) {
                    const linksDiv = document.getElementById("links");
                    const adminMoviesDiv = linksDiv.querySelector(".adminMovies");
                    const adminShowtimesDiv = linksDiv.querySelector(".adminShowtimes");

                    adminMoviesDiv.hidden = false;
                    adminShowtimesDiv.hidden = false;

                    adminMoviesDiv.setAttribute("href", "/admin/movies")
                    adminShowtimesDiv.setAttribute("href", "/admin/showtimes")
                }
            })
            .catch(error => {});
    }
});