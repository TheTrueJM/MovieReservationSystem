import { API, SITE, dateDisplay, timeDisplay } from "./exports.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchReservations();

    function fetchReservations() {
        fetch(API + "user/reservations", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => {
                if (response.ok) { return response.json(); }
                else { throw new Error(response.status); }
            })
            .then(reservations => displayReservations(reservations))
            .catch(error => { window.location.href = "/error500"; });
    }

    function displayReservations(reservations) {
        const reservationList = document.getElementById("showtimeList");
        reservationList.innerHTML = "";

        reservations.forEach(reservation => {
            const reservationDiv = document.createElement("a");
            reservationDiv.classList.add("card", "flex");
            reservationDiv.href = `${SITE}user/reservation/${reservation.id}`;

            const showtime = reservation.showtime;
            const movie = showtime.movie;

            reservationDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} Poster">
                <div class="details flexCol contentSpaced">
                    <div class="title">${showtime.movie.title}</div>
                    <div class="time">${dateDisplay(showtime.date)} | ${timeDisplay(showtime.time_start)}</div>
                    <div class="theatre">
                        <div class="flex contentSpaced">
                            <div>${showtime.theatre.toUpperCase()}</div>
                            <div>${reservation.seats.length} Seats Reserved</div>
                        </div>
                        <div>Reservation Cost: $${reservation.cost.toFixed(2)}</div>
                    </div>
                </div>
            `;

            reservationList.appendChild(reservationDiv);
        });
    }
});


window.updateUsername = updateUsername;

function updateUsername() {
    const username = document.getElementById("username").value;

    const feedback = document.getElementById("usernameFeedback");

    fetch(API + "user/updateUsername", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": username
        })
    })
        .then(response => {
            if (response.ok) { return response.json(); }
            else { return response.json().then(error => { throw new Error(error.message || "Invalid User Authorisation"); }); }
        })
        .then(data => {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            feedback.innerHTML = data.message + ". Reloading...";
            feedback.classList.add("feedbackSuccess")
            feedback.classList.remove("feedbackFail")
            setTimeout(() => { location.reload(); }, 2500);
        })
        .catch(error => {
            feedback.innerHTML = error.message;
            feedback.classList.add("feedbackFail")
            feedback.classList.remove("feedbackSuccess")
        });
}


window.updatePassword = updatePassword;

function updatePassword() {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirm").value;

    const feedback = document.getElementById("passwordFeedback");

    if (newPassword == confirm) {
        fetch(API + "user/updatePassword", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "current_password": currentPassword,
                "new_password": newPassword
            })
        })
            .then(response => {
                if (response.ok) { return response.json(); }
                else { return response.json().then(error => { throw new Error(error.message || "Invalid User Authorisation"); }); }
            })
            .then(data => {
                feedback.innerHTML = data.message + ". Reloading...";
                feedback.classList.add("feedbackSuccess")
                feedback.classList.remove("feedbackFail")
                setTimeout(() => { location.reload(); }, 2500);
            })
            .catch(error => {
                feedback.innerHTML = error.message;
                feedback.classList.add("feedbackFail")
                feedback.classList.remove("feedbackSuccess")
            });
    } else {
        feedback.innerHTML = "Password does not match Confirmation"
        feedback.classList.add("feedbackFail")
        feedback.classList.remove("feedbackSuccess")
    }
}