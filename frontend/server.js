const express = require("express");
const app = express();
const port = 4000;

const path = require("path");

app.use("/static", express.static(path.join(__dirname, "/static")));



app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/settings", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "user_settings.html"));
});


app.get(["/", "/movies"], (req, res) => {
    res.sendFile(path.join(__dirname, "public", "movies.html"));
});

app.get("/movie/:id", (req, res) => { // Not Number Routes
    res.sendFile(path.join(__dirname, "public", "movie.html"));
});

app.get("/showtimes", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "showtimes.html"));
});

app.get("/showtime/:id", (req, res) => { // Not Number Routes
    res.sendFile(path.join(__dirname, "public", "showtime.html"));
});


app.get("/admin/movies", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "movies.html"));
});

app.get("/admin/movie/:id", (req, res) => { // Not Number Routes
    res.sendFile(path.join(__dirname, "public", "movie.html"));
});

app.get("/admin/showtimes", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "showtimes.html"));
});

app.get("/admin/showtime/:id", (req, res) => { // Not Number Routes
    res.sendFile(path.join(__dirname, "public", "showtime.html"));
});


app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});