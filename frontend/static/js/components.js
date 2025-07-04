// Header
class CHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                MovieSiteName
            </header>

            <nav>
                <div id="links">
                    <a href="/movies" class="movies">Movies</a>
                    <a href="/showtimes" class="showtimes">Showtimes</a>
                    <a class="adminMovies" hidden>Admin Movies</a>
                    <a class="adminShowtimes" hidden>Admin Showtimes</a>
                </div>
                
                <div id="user">
                    <a href="/login" class="unauth">Login</a>
                    <a href="/signup" class="unauth">Sign Up</a>
                    
                    <a href="/user" class="auth" hidden>User Details</a>
                    <a href="/" onclick="localStorage.clear()" class="auth" hidden>Logout</a>
                </div>
            </nav>
        `
    }
}
customElements.define("c-header", CHeader)