import { API, SITE } from "./exports.js";

window.login=login;

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const feedback = document.getElementById("feedback");

    fetch(API + "auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": username,
            "password": password
        })
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
            localStorage.setItem("refresh_token", data.refresh_token);
            
            feedback.innerHTML = data.message + ". Redirecting...";
            feedback.classList.add("feedbackSuccess")
            feedback.classList.remove("feedbackFail")
            setTimeout(() => {window.location.href = `${SITE}`;}, 2500);
        })
        .catch(error => {
            feedback.innerHTML = error.message;
            feedback.classList.add("feedbackFail")
            feedback.classList.remove("feedbackSuccess")
        });
}