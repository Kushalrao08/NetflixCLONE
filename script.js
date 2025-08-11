const API_KEY = "2fe5985b7f0015e0d6c6e17e626d1d9e"; 
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

let movies = [];
let currentMovieIndex = 0;

async function loadMovies() {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await res.json();

    const moviePromises = data.results.map(async m => {
        let trailerKey = null;
        try {
            const videoRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${API_KEY}&language=en-US`);
            const videoData = await videoRes.json();
            const trailer = videoData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
            if (trailer) trailerKey = trailer.key;
        } catch (err) {
            console.error("Trailer fetch error:", err);
        }

        const posterPath = m.poster_path ? IMAGE_BASE + m.poster_path : "https://via.placeholder.com/500x750?text=No+Image";

        return {
            title: m.title,
            description: m.overview || "No description available.",
            image: posterPath,
            trailer: trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : "https://www.youtube.com/embed/dQw4w9WgXcQ"
        };
    });

    movies = await Promise.all(moviePromises);
    renderMovies();
}

function renderMovies() {
    const movieGrid = document.getElementById("movieGrid");
    movieGrid.innerHTML = "";
    movies.forEach((movie, index) => {
        const div = document.createElement("div");
        div.classList.add("movie-card");
        div.dataset.title = movie.title;
        div.dataset.description = movie.description;
        div.dataset.image = movie.image;
        div.innerHTML = `<img src="${movie.image}" alt="${movie.title}"><p>${movie.title}</p>`;
        div.addEventListener("click", () => {
            currentMovieIndex = index;
            openMovie(currentMovieIndex);
        });
        movieGrid.appendChild(div);
    });
}

function openMovie(index) {
    const movie = movies[index];
    document.getElementById("movieTitle").textContent = movie.title;
    document.getElementById("movieDescription").textContent = movie.description;
    document.getElementById("movieTrailer").src = movie.trailer;
    document.getElementById("moviePlayerModal").style.display = "flex";
}

function closeMovie() {
    document.getElementById("movieTrailer").src = "";
    document.getElementById("moviePlayerModal").style.display = "none";
}

document.getElementById("closePlayer").addEventListener("click", closeMovie);
document.getElementById("moviePlayerModal").addEventListener("click", (e) => {
    if (e.target.id === "moviePlayerModal") closeMovie();
});

document.getElementById("nextMovie").addEventListener("click", () => {
    currentMovieIndex = (currentMovieIndex + 1) % movies.length;
    openMovie(currentMovieIndex);
});

document.getElementById("prevMovie").addEventListener("click", () => {
    currentMovieIndex = (currentMovieIndex - 1 + movies.length) % movies.length;
    openMovie(currentMovieIndex);
});

// My List
document.getElementById("addToList").addEventListener("click", () => {
    let myList = JSON.parse(localStorage.getItem("myList")) || [];
    const movie = movies[currentMovieIndex];
    if (!myList.find(item => item.title === movie.title)) {
        myList.push(movie);
        localStorage.setItem("myList", JSON.stringify(myList));
        renderMyList();
        alert(`${movie.title} added to My List`);
    } else {
        alert(`${movie.title} is already in My List`);
    }
});

function renderMyList() {
    const myListGrid = document.getElementById("myListGrid");
    myListGrid.innerHTML = "";
    const myList = JSON.parse(localStorage.getItem("myList")) || [];
    myList.forEach(movie => {
        const div = document.createElement("div");
        div.classList.add("movie-card");
        div.dataset.title = movie.title;
        div.dataset.description = movie.description;
        div.innerHTML = `<img src="${movie.image}" alt="${movie.title}"><p>${movie.title}</p>`;
        div.addEventListener("click", () => {
            currentMovieIndex = movies.findIndex(m => m.title === movie.title);
            openMovie(currentMovieIndex);
        });
        myListGrid.appendChild(div);
    });
}

// Search
document.getElementById("searchBar").addEventListener("keyup", () => {
    const query = document.getElementById("searchBar").value.toLowerCase();
    document.querySelectorAll(".movie-card").forEach(card => {
        const title = card.dataset.title.toLowerCase();
        card.style.display = title.includes(query) ? "block" : "none";
    });
});

// Login & Subscription
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginSubmit = document.getElementById("loginSubmit");
const profileBtn = document.getElementById("profileBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const subscribeModal = document.getElementById("subscribeModal");
const closeSubscribe = document.getElementById("closeSubscribe");

loginBtn.addEventListener("click", () => loginModal.style.display = "flex");
closeLogin.addEventListener("click", () => loginModal.style.display = "none");
loginSubmit.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    if (email && password) {
        localStorage.setItem("user", email);
        alert(`Welcome ${email}`);
        loginModal.style.display = "none";
        loginBtn.style.display = "none";
        profileBtn.style.display = "inline-block";
    } else {
        alert("Enter valid email & password");
    }
});

subscribeBtn.addEventListener("click", () => subscribeModal.style.display = "flex");
closeSubscribe.addEventListener("click", () => subscribeModal.style.display = "none");
document.querySelectorAll(".plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        localStorage.setItem("plan", btn.dataset.plan);
        alert(`You subscribed to ${btn.dataset.plan} plan`);
        subscribeModal.style.display = "none";
    });
});

profileBtn.addEventListener("click", () => {
    alert(`User: ${localStorage.getItem("user") || "Not logged in"}\nPlan: ${localStorage.getItem("plan") || "None"}`);
    if (confirm("Do you want to logout?")) {
        localStorage.clear();
        window.location.reload();
    }
});

if (localStorage.getItem("user")) {
    loginBtn.style.display = "none";
    profileBtn.style.display = "inline-block";
}

// Initialize
loadMovies();
renderMyList();

