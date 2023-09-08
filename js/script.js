const global = {
    currentPage: window.location.pathname,
    search: {
        type: '',
        term: '',
        page: 1,
        total_pages: 1,
        total_results: 1,
    },
    api: {
        apiKey: '48873003f5df50425a544b503d4845f3',
        apiUrl: 'https://api.themoviedb.org/3/',
    }
}

// search movies / shows
async function search() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    global.search.type = urlParams.get('type');
    global.search.term = urlParams.get('search-term');



    if(global.search.term !== '' && global.search.term !== null) {
        const { results, page, total_pages, total_results } = await searchAPIData();

        if(results.length === 0) {
            showAlert('No Search Results', 'alert-success')
            return;
        }

        global.search.page = page;
        global.search.total_pages = total_pages;
        global.search.total_results = total_results;

        displaySearchResults(results);

    }
    else {
        showAlert('Please Enter a Search term', 'removing');
    }
}

function displaySearchResults(results) {
    results.forEach(result => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
          <a href="${global.search.type}-details.html?id=${result.id}">
          ${
            result.poster_path ? 
                `<img
                src="https://image.tmdb.org/t/p/w500${result.poster_path}"
                class="card-img-top"
                alt="${global.search.type === 'movie' ? result.title : result.name}"
              />`
                : `<img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${global.search.type === 'movie' ? result.title : result.name}"
              />`
          }
          </a>
          <div class="card-body">
            <h5 class="card-title">${global.search.type === 'movie' ? result.title : result.name}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${global.search.type === 'movie' ? result.release_date : result.first_air_date}</small>
            </p>
          </div>
        `

        document.querySelector('#search-results').appendChild(div);
        
    });
    document.querySelector('#search-results-heading').innerHTML = `<h2>${results.length} results of ${global.search.total_results} for ${global.search.term}</h2>`
    displayPagination();
}



function displayPagination() {
    const div = document.createElement('div');
    div.classList.add('pagination');

    div.innerHTML = `
        <button class="btn btn-primary" id="prev">Prev</button>
        <button class="btn btn-primary" id="next">Next</button>
        <div class="page-counter">${global.search.page} of ${global.search.total_pages}</div>
    `
    document.querySelector('#pagination').appendChild(div);

    if(page === 1) {
        document.querySelector('#prev').disabled = true;
    }
}

// display swiper
async function displaySwiper() {
    const { results } = await fetchAPIData('movie/now_playing');

    results.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('swiper-slide');

        div.innerHTML = `
            <a href="movie-details.html?id=${movie.id}">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
            </a>
            <h4 class="swiper-rating">
              <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10
            </h4>`

        document.querySelector('.swiper-wrapper').appendChild(div);

        initSwiper();
    });
}

function initSwiper() {
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        autoplay: {
            delay: 4000,
        },
        freeMode: true,
        loop: true,
        speed: 800,
        breakpoints: {
            500: {
                slidesPerView: 2,
            },
            700: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
        },
      });
}

// display show details
async function displayShowDetails() {
    const show_id = window.location.search.split('=')[1];
    
    const show = await fetchAPIData(`tv/${show_id}`);
    
    displayBackdrop('tv', show.backdrop_path);

    console.log(show.last_episode_to_air);

    const div = document.createElement('div');

    div.innerHTML = `
        <div class="details-top">
        <div>
        ${
            show.poster_path ? 
                `<img
                src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                class="card-img-top"
                alt="${show.name}"
              />`
                : `<img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${show.name}"
              />`
          }
        </div>
        <div>
        <h2>${show.name}</h2>
        <p>
            <i class="fas fa-star text-primary"></i>
            ${show.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${show.last_air_date}</p>
        <p>
            ${show.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
            ${show.genres.map(genre => `<li>${genre.name}</li>`).join('')}
        </ul>
        <a href="${show.homepage}" target="_blank" class="btn">Visit show Homepage</a>
        </div>
    </div>
    <div class="details-bottom">
        <h2>Show Info</h2>
        <ul>
        <li><span class="text-secondary">Number of Episodes : </span> ${show.number_of_episodes}</li>
        <li><span class="text-secondary">Last Episode to air : </span> ${show.last_episode_to_air.name}</li>
        <li><span class="text-secondary">Status : </span> ${show.status}</li>
        </ul>
        <h4>Production Companies</h4>
        <div class="list-group">
            ${show.production_companies.map(company => `<li>${company.name}</li>`).join('')}
        </div>
    </div>`

    document.querySelector('#show-details').appendChild(div);
}

// display movie details
async function displayMovieDetails() {
    const movie_id = window.location.search.split('=')[1];
    console.log(movie_id);
    
    const movie = await fetchAPIData(`movie/${movie_id}`);
    
    displayBackdrop('movie', movie.backdrop_path);

    const div = document.createElement('div');

    div.innerHTML = `
        <div class="details-top">
        <div>
        ${
            movie.poster_path ? 
                `<img
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                class="card-img-top"
                alt="${movie.title}"
              />`
                : `<img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${movie.title}"
              />`
          }
        </div>
        <div>
        <h2>${movie.title}</h2>
        <p>
            <i class="fas fa-star text-primary"></i>
            ${movie.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${movie.release_date}</p>
        <p>
            ${movie.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
            ${movie.genres.map(genre => `<li>${genre.name}</li>`).join('')}
        </ul>
        <a href="${movie.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>
        </div>
    </div>
    <div class="details-bottom">
        <h2>Movie Info</h2>
        <ul>
        <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(movie.budget)}</li>
        <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(movie.revenue)}</li>
        <li><span class="text-secondary">Runtime:</span> ${movie.runtime} minutes</li>
        <li><span class="text-secondary">Status:</span> ${movie.status}</li>
        </ul>
        <h4>Production Companies</h4>
        <div class="list-group">
            ${movie.production_companies.map(company => `<li>${company.name}</li>`).join('')}
        </div>
    </div>`

    document.querySelector('#movie-details').appendChild(div);
}

// display backdrop on functions image
function displayBackdrop(type, backgroundPath) {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
    overlayDiv.style.backgroundSize = 'cover';
    overlayDiv.style.backgroundPosition = 'center';
    overlayDiv.style.backgroundRepeat = 'no-repeat';
    overlayDiv.style.height = '100vh';
    overlayDiv.style.width = '100vw';
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.zIndex = '-1';
    overlayDiv.style.opacity = '0.1';

    if(type === 'movie') {
        document.querySelector('#movie-details').appendChild(overlayDiv);
    }
    else {
        document.querySelector('#show-details').appendChild(overlayDiv);
    }     
}

// display popular movies
async function displayPopularMovies() {
    const { results } = await fetchAPIData('movie/popular');
    
    results.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
          <a href="movie-details.html?id=${movie.id}">
          ${
            movie.poster_path ? 
                `<img
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                class="card-img-top"
                alt="${movie.title}"
              />`
                : `<img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="Movie Title"
              />`
          }
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>
        `

        document.querySelector('#popular-movies').appendChild(div);
    }) 
}

// display popular shows
async function displayPopularShows() {
    const { results } = await fetchAPIData('tv/popular');
    results.forEach(show => {
        const div = document.createElement('div');
        div.classList.add('card');

        div.innerHTML = `
        <a href="tv-details.html?id=${show.id}">
        ${
            show.poster_path ? `
                <img
                    src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                    class="card-img-top"
                    alt="${show.name}"
                />`
            :  `
                <img
                    src="images/no-image.jpg"
                    class="card-img-top"
                    alt="${show.name}"
                />`
        }
        </a>
        <div class="card-body">
          <h5 class="card-title">${show.name}</h5>
          <p class="card-text">
            <small class="text-muted">Aired: w500${show.first_air_date}</small>
          </p>
        </div>
        `
        document.querySelector('#popular-shows').appendChild(div);
    });
}

async function searchAPIData() {
    const API_KEY = global.api.apiKey;
    const API_URL = global.api.apiUrl;

    showSpinner();

    const response = await fetch(`${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}`);
    const data = await response.json();

    hideSpinner();

    return data;
}

// fetch data from TMDB API
async function fetchAPIData(endpoint) {
    const API_KEY = global.api.apiKey;
    const API_URL = global.api.apiUrl;

    showSpinner();

    const response = await fetch(`${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
    const data = await response.json();

    hideSpinner();

    return data;
}

function showSpinner() {
    document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
    document.querySelector('.spinner').classList.remove('show');
}

function highlightActiveLink() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if(global.currentPage === link.getAttribute('href')) {
            link.classList.add('active');
        }
    });
}

function addCommasToNumber(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function showAlert(message, classname) {
    const div  = document.createElement('div');
    div.classList.add('alert', classname);
    div.appendChild(document.createTextNode(message));
    document.querySelector('#alert').appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}

function init() {
    switch(global.currentPage) {
        case '/':
        case '/index.html':
            displaySwiper();
            displayPopularMovies();
            break;
        case '/shows.html':
            displayPopularShows();
            break;
        case '/movie-details.html':
            displayMovieDetails();
            break;
        case '/tv-details.html':
            displayShowDetails();
            break;
        case '/search.html':
            search();
            break;
    }
    highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);