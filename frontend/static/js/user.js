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


const loginButton = document.getElementById("loginButton");
const loginModal = document.getElementById("loginModal");

loginButton.onclick = openLoginModal;
window.openLoginModal=openLoginModal;
window.cancelLoginModal=cancelLoginModal;

function openLoginModal() {
    loginModal.showModal();
}

function cancelLoginModal() {
    loginModal.close();
}

window.login=login;

function login() {
    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;
    const loginFeedback = document.getElementById("loginFeedback");

    fetch(API + "auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": loginUsername,
            "password": loginPassword
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
            
            loginFeedback.innerHTML = data.message + ". Reloading...";
            loginFeedback.classList.add("feedbackSuccess")
            loginFeedback.classList.remove("feedbackFail")
            setTimeout(() => {location.reload();}, 2500);
        })
        .catch(error => {
            loginFeedback.innerHTML = error.message;
            loginFeedback.classList.add("feedbackFail")
            loginFeedback.classList.remove("feedbackSuccess")
        });
}


const signupButton = document.getElementById("signupButton");
const signupModal = document.getElementById("signupModal");

signupButton.onclick = openSignupModal;
window.openSignupModal=openSignupModal;
window.cancelSignupModal=cancelSignupModal;

function openSignupModal() {
    signupModal.showModal();
}

function cancelSignupModal() {
    signupModal.close();
}

window.signup=signup;

function signup() {
    const signupUsername = document.getElementById("signupUsername").value;
    const signupPassword = document.getElementById("signupPassword").value;
    const signupConfirm = document.getElementById("signupConfirm").value;
    const signupFeedback = document.getElementById("signupFeedback");

    if (signupPassword == signupConfirm) {
        fetch(API + "auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": signupUsername,
                "password": signupPassword
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
                
                signupFeedback.innerHTML = data.message + ". Reloading...";
                signupFeedback.classList.add("feedbackSuccess")
                signupFeedback.classList.remove("feedbackFail")
                setTimeout(() => {location.reload();}, 2500);
            })
            .catch(error => {
                signupFeedback.innerHTML = error.message;
                signupFeedback.classList.add("feedbackFail")
                signupFeedback.classList.remove("feedbackSuccess")
            });
    } else {
        signupFeedback.innerHTML = "Password does not match Confirmation"
        signupFeedback.classList.add("feedbackFail")
        signupFeedback.classList.remove("feedbackSuccess")
    }
}