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
                const unauthDiv = userDiv.querySelector(".unauth");
                const authDiv = userDiv.querySelector(".auth");

                unauthDiv.hidden = true;
                authDiv.hidden = false;

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
                    linksDiv.innerHTML += `
                        <a href="/admin/movies">Admin Movies</a>
                        <a href="/admin/showtimes">Admin Showtimes</a>
                    `;
                }
            })
            .catch(error => {});
    }
});