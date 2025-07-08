import os, requests, json
from dotenv import load_dotenv


load_dotenv()


AUTH_URL = "https://api.themoviedb.org/3/authentication"
MOVIES_URL = "https://api.themoviedb.org/3/discover/movie?language=en-US&page=1"
GENRES_URL = "https://api.themoviedb.org/3/genre/movie/list?language=en"
MOVIE_DETAILS_URL = "https://api.themoviedb.org/3/movie/{}?language=en-US"

REQUEST_HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {os.getenv("TMDB_API_KEY")}"
}


def valid_authentication() -> bool:
    response = requests.get(AUTH_URL, headers=REQUEST_HEADERS)
    auth = json.loads(response.text)
    return auth["success"]

def movies_import() -> list[dict]:
    response = requests.get(MOVIES_URL, headers=REQUEST_HEADERS)
    movies = json.loads(response.text)
    return movies

def genres_import() -> dict[int, str]:
    response = requests.get(GENRES_URL, headers=REQUEST_HEADERS)
    genres = json.loads(response.text)
    return {genre["id"]: genre["name"] for genre in genres["genres"]}

def get_movie_runtime(id: int) -> int:
    response = requests.get(MOVIE_DETAILS_URL.format(id), headers=REQUEST_HEADERS)
    movie = json.loads(response.text)
    return movie["runtime"]