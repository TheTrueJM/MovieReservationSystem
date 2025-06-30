// Header
class CHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                MovieSiteName
            </header>

            <nav>
                <div id="links">
                    <a href="/movies">Movies</a>
                    <a href="/showtimes">Showtimes</a>
                </div>
                <div id="user">
                    <div class="unauth">
                        <a href="/login">Login</a>
                        <a href="/signup">Sign Up</a>
                    </div>
                    <div class="auth" hidden>
                        <a href="/user">User Details</a>
                        <a href="/" onclick="localStorage.clear()">Logout</a>
                    </div>
                </div>
            </nav>
        `
    }
}
customElements.define("c-header", CHeader)