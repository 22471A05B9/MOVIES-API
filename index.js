document.addEventListener("DOMContentLoaded", function () {
    loadTrending();
});

const mainContainer = document.getElementById("mainContainer");
const mainContainerTitle = document.getElementById("mainContainerTitle");
const baseUrl = "https://image.tmdb.org/t/p/";
const size = "w500";
const apiKey = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0M2QwOGQxM2NhOTUwODczN2NiN2E0ZDQ1ZGI4OTE2ZiIsIm5iZiI6MS43NDY1OTEyNjg1ODA5OTk5ZSs5LCJzdWIiOiI2ODFhZGUyNDFiOGY5MGNkYTE1YWYyODEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.yEAlHJSL1k6jn3YP9rwxQbfwAEspOiiCXDYO4nQscQk';

async function loadTrending() {
    const url = 'https://api.themoviedb.org/3/trending/all/week?language=en-US';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: apiKey
        }
    };

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        display(data.results, "Trending");
    } catch (err) {
        console.error('Error:', err);
    }
}

async function display(data, title) {
    mainContainerTitle.innerHTML = `<h2>${title}</h2>`;
    mainContainer.innerHTML = "";

    for (let item of data) {
        const genreNames = await getGenres(item);

        let movieCard = {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            genre: genreNames,
            release_date: item.release_date || item.first_air_date,
            vote_average: item.vote_average,
            vote_count: item.vote_count
        };

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="imageDiv">
                <img src="${baseUrl}${size}${item.poster_path}" class="card-img-top2" alt="Poster">
            </div>
            <div class="card-body">
                <h5 class="card-title">${movieCard.title}</h5>
                <p>${genreNames.join(", ")}</p>
                <p><strong>Released:</strong> ${movieCard.release_date || 'N/A'}</p>
                ${movieCard.vote_average ? `<p class="rating"><strong>Rating:</strong> ${movieCard.vote_average.toFixed(1)}/10 (${movieCard.vote_count})</p>` : ''}
                <div class="d-flex justify-content-between">
                    <a href="https://www.themoviedb.org/movie/${item.id}" target="_blank" class="btn btn-primary">Know More</a>
                    <button class="btn btn-primary addFavButton">Add ❤</button>
                </div>
            </div>
        `;

        if (item.poster_path) {
            mainContainer.appendChild(card);
        }

        card.querySelector(".addFavButton").addEventListener("click", () => addToFavorites(movieCard));
    }
}

async function getGenres(data) {
    const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en-US';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: apiKey
        }
    };

    const res = await fetch(url, options);
    const genreData = await res.json();
    const genreIds = data.genre_ids || [];
    return genreData.genres
        .filter(g => genreIds.includes(g.id))
        .map(g => g.name);
}

async function loadMovies(endpoint) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: apiKey
        }
    };

    try {
        const pagePromises = [];
        for (let i = 1; i <= 3; i++) {
            const url = `https://api.themoviedb.org/3/movie/${endpoint}?language=en-US&page=${i}`;
            pagePromises.push(fetch(url, options).then(res => res.json()));
        }
        const allData = await Promise.all(pagePromises);
        const allResults = allData.flatMap(d => d.results);
        display(allResults, endpoint.replace("_", " ").toUpperCase());
    } catch (err) {
        console.error("Error:", err);
    }
}

// Button event listeners
document.getElementById("popularButton").addEventListener("click", () => loadMovies("popular"));
document.getElementById("nowPlayingButton").addEventListener("click", () => loadMovies("now_playing"));
document.getElementById("upcomingButton").addEventListener("click", () => loadMovies("upcoming"));
document.getElementById("topRatedButton").addEventListener("click", () => loadMovies("top_rated"));
document.getElementById("favoritesButton").addEventListener("click", displayFavorites);

// Search
document.getElementById("searchForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const movieName = document.getElementById("inputMovie").value.trim();
    if (!movieName) return;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: apiKey
        }
    };

    try {
        const pagePromises = [];
        for (let i = 1; i <= 3; i++) {
            const url = `https://api.themoviedb.org/3/search/multi?query=${movieName}&include_adult=false&language=en-US&page=${i}`;
            pagePromises.push(fetch(url, options).then(res => res.json()));
        }
        const results = await Promise.all(pagePromises);
        const allResults = results.flatMap(d => d.results);
        display(allResults, `Results for "${movieName}"`);
    } catch (err) {
        console.error("Search error:", err);
    }
});

// Favorites functions
function addToFavorites(movie) {
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favs.some(item => item.id === movie.id)) {
        favs.push(movie);
        localStorage.setItem("favorites", JSON.stringify(favs));
        alert(`${movie.title} added to favorites!`);
    } else {
        alert(`${movie.title} is already in favorites.`);
    }
}

function displayFavorites() {
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    mainContainerTitle.innerHTML = "<h2>Favorites</h2>";
    mainContainer.innerHTML = "";

    if (favs.length === 0) {
        mainContainer.innerHTML = `<h5>No favorites yet.</h5>`;
        return;
    }

    favs.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="imageDiv">
                <img src="${baseUrl}${size}${item.poster_path}" class="card-img-top2" alt="Poster">
            </div>
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p>${item.genre.join(", ")}</p>
                <p><strong>Released:</strong> ${item.release_date}</p>
                <p><strong>Rating:</strong> ${item.vote_average.toFixed(1)}/10 (${item.vote_count})</p>
                <div class="d-flex justify-content-between">
                    <a href="https://www.themoviedb.org/movie/${item.id}" target="_blank" class="btn btn-primary">Know More</a>
                    <button class="btn btn-danger removeBtn">Remove ❌</button>
                </div>
            </div>
        `;

        mainContainer.appendChild(card);

        card.querySelector(".removeBtn").addEventListener("click", () => {
            favs = favs.filter(f => f.id !== item.id);
            localStorage.setItem("favorites", JSON.stringify(favs));
            displayFavorites(); // re-render
        });
    });
}

// Collapse navbar on mobile after clicking
$(document).ready(function () {
    $('.navbar-nav>li>a').on('click', function () {
        $('.navbar-collapse').collapse('hide');
    });
});
