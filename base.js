// Your OpenWeatherMap API key - replace with your actual API key
const api_key = '6755f343b2d49c1cfe9e50f77f738fcf';

let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];

// Function to fetch coordinates for a city name
function getCityCoordinates(cityName) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${api_key}`;
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (!data.length) throw new Error(`City "${cityName}" not found`);
            // Return needed data
            return data[0];
        });
}

// Function to fetch current weather data
function getWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch weather data');
            return res.json();
        });
}

// Function to fetch 5-day weather forecast
function getFiveDayForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch 5-day forecast');
            return res.json();
        });
}

// Function to update current weather UI
function updateWeatherUI(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const cityName = data.name;
    const country = data.sys.country;

    if (!currentWeatherCard) return;

    currentWeatherCard.innerHTML = `
        <div class="current-weather">
            <div class="details">
                <p>Now</p>
                <h2>${temp}&deg;C</h2>
                <p>${description}</p>
            </div>
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">
            </div>
        </div>
        <hr>
        <div class="card-footer">
            <p><i class="bx bxs-edit-location"></i> ${cityName}, ${country}</p>
        </div>
    `;
}

// Function to update 5-day forecast UI
function updateFiveDayForecast(data) {
    const forecastContainer = document.querySelector('.day-forecast');
    if (!forecastContainer) return;

    // Clear previous forecast
    forecastContainer.innerHTML = '';

    // Filter forecast for approximately 12:00 PM each day for next 5 days
    const noonForecasts = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    ).slice(0, 5);

    noonForecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
        const temp = Math.round(item.main.temp);
        const weatherDesc = item.weather[0].description;
        const iconCode = item.weather[0].icon;

        forecastContainer.innerHTML += `
        <div class="forecast-item">
            <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${weatherDesc}">
                <span>${temp}&deg;C</span>
            </div>
            <p>${dayName}</p>
            <p>${weatherDesc}</p>
        </div>
        `;
    });
}

// Event handler for "Search" button click
searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        alert('Please enter a city name');
        return;
    }
    getCityCoordinates(cityName)
        .then(({ lat, lon }) =>
            Promise.all([
                getWeather(lat, lon),
                getFiveDayForecast(lat, lon)
            ])
        )
        .then(([weatherData, forecastData]) => {
            updateWeatherUI(weatherData);
            updateFiveDayForecast(forecastData);
        })
        .catch(err => alert(err.message));
});

// Event handler for "Current Location" button click
locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        Promise.all([
            getWeather(latitude, longitude),
            getFiveDayForecast(latitude, longitude)
        ])
        .then(([weatherData, forecastData]) => {
            updateWeatherUI(weatherData);
            updateFiveDayForecast(forecastData);
        })
        .catch(err => alert(err.message));
    }, () => {
        alert('Unable to retrieve your location');
    });
});
