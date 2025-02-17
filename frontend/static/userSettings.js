import { API, SITE } from "./exports.js";

document.addEventListener("DOMContentLoaded", function() {
    fetchReservations();

    function fetchReservations() {
        fetch(API + "user/reservations", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
            .then(response => response.json())
            .then(reservations => displayReservations(reservations))
            .catch(error => {});
    }

    function displayReservations(reservations) {
        console.log(reservations)
        const reservationList = document.getElementById("reservationList");
        reservationList.innerHTML = "";

        reservations.forEach(reservation => {
            const reservationDiv = document.createElement("a");
            reservationDiv.classList.add("card", "flex");
            reservationDiv.href = `${SITE}user/reservations/${reservation.id}`;

            const showtime = reservation.showtime;
            const movie = showtime.movie;

            reservationDiv.innerHTML = `
                <img src="${showtime.movie.image_url}" alt="${showtime.movie.title} image">
                <div class="details flexCol contentSpaced textCenter fontRegular">
                    <div class="textBold">${showtime.movie.title}</div>
                    <div class="textBolder fontSubtitle">${showtime.date} | ${showtime.time_start}</div>
                    <div>
                        <div class="flex contentSpaced">
                            <div>${showtime.theatre.toUpperCase()}</div>
                            <div>${reservation.seats.length} Seats Reserved</div>
                        </div>
                        <div>Reservation Cost: $${reservation.cost}</div>
                    </div>
                </div>
            `;

            reservationList.appendChild(reservationDiv);
        });
    }
});


window.updateUsername=updateUsername;

function updateUsername() {
    const username = document.getElementById("username").value;

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
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => { throw new Error(error.message); });
            }
        })
        .then(data => {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
        })
        .catch(error => {});
}


window.updatePassword=updatePassword;

function updatePassword() {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirm").value;

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
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(error => { throw new Error(error.message); });
                }
            })
            .then(data => {
                console.log(data)
            })
            .catch(error => {});
    }
}