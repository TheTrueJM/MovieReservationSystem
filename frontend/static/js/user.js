import { API } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    checkAuth();

    function checkAuth() {
        const userDiv = document.getElementById("user");

        fetch(API + "auth/refresh", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("refresh_token")}`
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(error => { throw new Error(error.message); });
                }
            })
            .then(data => {
                localStorage.setItem("access_token", data.access_token);

                userDiv.innerHTML = `
                    <a href="/user">User Details</a>
                    <a href="/" onclick="localStorage.clear()">Logout</a>
                `;

                checkAdmin();
            })
            .catch(error => {
                userDiv.innerHTML = `
                    <a href="/login">Login</a>
                    <a href="/signup">Sign Up</a>
                `;
            });
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