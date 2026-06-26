// =========================================
// SkyPulse Weather Pro
// Part 1A
// =========================================

// ---------- API KEY ----------
const apiKey = "b3eae25a346ef89c09037e663aa7bf66";

// ---------- Global Variables ----------
let currentUnit = "C";
let currentWeatherData = null;
let currentCity = "";

// ---------- Date & Time ----------

function updateDateTime() {

    const now = new Date();

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.getElementById("time").textContent =
        now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}

updateDateTime();
setInterval(updateDateTime, 1000);

// ---------- Temperature ----------

function convertTemperature(value) {

    if (currentUnit === "C") {

        return Math.round(value) + "°C";

    }

    return Math.round((value * 9 / 5) + 32) + "°F";

}

// ---------- Toggle Buttons ----------

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

if (celsiusBtn && fahrenheitBtn) {

    celsiusBtn.addEventListener("click", () => {

        if (currentUnit === "C") return;

        currentUnit = "C";

        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");

        if (currentWeatherData) {

            updateWeatherUI(currentWeatherData);

        }

    });

    fahrenheitBtn.addEventListener("click", () => {

        if (currentUnit === "F") return;

        currentUnit = "F";

        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");

        if (currentWeatherData) {

            updateWeatherUI(currentWeatherData);

        }

    });

}

// ---------- Enter Key Search ----------

const cityInput = document.getElementById("city");

if (cityInput) {

    cityInput.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            getWeather();

        }

    });

}
// =========================================
// SkyPulse Weather Pro
// Part 1B
// Search + GPS + Current Weather
// =========================================

// ---------- Search Weather ----------

async function getWeather() {

    const city = document.getElementById("city").value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    currentCity = city;

    await fetchCurrentWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

}

// ---------- GPS Weather ----------

function getLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");
        return;

    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            await fetchCurrentWeather(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );

        },

        () => {

            alert("Unable to get your location.");

        }

    );

}

// ---------- Fetch Current Weather ----------

async function fetchCurrentWeather(url) {

    try {

        const response = await fetch(url);

        const data = await response.json();

        if (data.cod != 200) {

            alert("City not found.");
            return;

        }

        currentWeatherData = data;
        currentCity = data.name;

        updateWeatherUI(data);

        getForecast(currentCity);
        getDailyForecast(currentCity);
        getAQI(data.coord.lat, data.coord.lon);

    }

    catch (error) {

        console.log(error);

        alert("Something went wrong.");

    }

}
// =========================================
// SkyPulse Weather Pro
// Part 1C
// UI Update + Weather Icon + Dynamic Background
// =========================================

function updateWeatherUI(data) {

    // Location
    document.getElementById("location").textContent =
        `${data.name}, ${data.sys.country}`;

    // Temperature
    document.getElementById("temp").textContent =
        convertTemperature(data.main.temp);

    document.getElementById("condition").textContent =
        data.weather[0].main;

    document.getElementById("feels").textContent =
        "Feels Like " + convertTemperature(data.main.feels_like);

    // Humidity
    document.getElementById("humidity").textContent =
        data.main.humidity + "%";

    // Wind
    document.getElementById("wind").textContent =
        data.wind.speed + " m/s";

    // Visibility
    document.getElementById("visibility").textContent =
        (data.visibility / 1000).toFixed(1) + " km";

    // Pressure
    document.getElementById("pressure").textContent =
        data.main.pressure + " hPa";

    // Sunrise
    document.getElementById("sunrise").textContent =
        new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    // Sunset
    document.getElementById("sunset").textContent =
        new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    // Weather Icon
    const weather = data.weather[0].main;
    const icon = document.getElementById("icon");

    switch (weather) {

        case "Clear":
            icon.innerHTML = "☀️";
            break;

        case "Clouds":
            icon.innerHTML = "☁️";
            break;

        case "Rain":
        case "Drizzle":
            icon.innerHTML = "🌧️";
            break;

        case "Thunderstorm":
            icon.innerHTML = "⛈️";
            break;

        case "Snow":
            icon.innerHTML = "❄️";
            break;

        case "Mist":
        case "Fog":
        case "Haze":
            icon.innerHTML = "🌫️";
            break;

        default:
            icon.innerHTML = "🌤️";
    }

    // Dynamic Background
    document.body.className = "";

    if (weather === "Clear") {

        const hour = new Date().getHours();

        if (hour >= 18 || hour <= 5) {
            document.body.classList.add("night");
        } else {
            document.body.classList.add("clear");
        }

    }
    else if (weather === "Clouds") {
        document.body.classList.add("clouds");
    }
    else if (weather === "Rain" || weather === "Drizzle") {
        document.body.classList.add("rain");
    }
    else if (weather === "Thunderstorm") {
        document.body.classList.add("thunder");
    }
    else if (weather === "Snow") {
        document.body.classList.add("snow");
    }
    else if (
        weather === "Mist" ||
        weather === "Fog" ||
        weather === "Haze"
    ) {
        document.body.classList.add("mist");
    }
    else {
        document.body.classList.add("clear");
    }

}
// =========================================
// SkyPulse Weather Pro
// Part 2A
// Hourly Forecast
// =========================================

async function getForecast(city) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        if (data.cod !== "200") return;

        const forecastContainer =
            document.getElementById("forecast");

        forecastContainer.innerHTML = "";

        // Next 8 forecasts (3-hour interval)

        data.list.slice(0, 8).forEach(item => {

            const time = new Date(item.dt * 1000)
                .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            const icon =
                `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

            const card = document.createElement("div");

            card.className = "forecast-card";

            card.innerHTML = `
                <h4>${time}</h4>

                <img src="${icon}" alt="Weather Icon">

                <p>${item.weather[0].main}</p>

                <h3>${convertTemperature(item.main.temp)}</h3>
            `;

            forecastContainer.appendChild(card);

        });

    }

    catch (error) {

        console.error("Hourly Forecast Error:", error);

    }

}
// =========================================
// SkyPulse Weather Pro
// Part 2B
// 5-Day Forecast
// =========================================

async function getDailyForecast(city) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        if (data.cod !== "200") return;

        const dailyForecast =
            document.getElementById("dailyForecast");

        dailyForecast.innerHTML = "";

        const addedDays = [];

        data.list.forEach(item => {

            const date = new Date(item.dt * 1000);

            const dayName = date.toLocaleDateString("en-US", {
                weekday: "short"
            });

            if (
                addedDays.includes(dayName) ||
                addedDays.length >= 5
            ) {
                return;
            }

            addedDays.push(dayName);

            const icon =
                `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

            const card = document.createElement("div");

            card.className = "day-card";

            card.innerHTML = `
                <h4>${dayName}</h4>

                <img src="${icon}" alt="Weather Icon">

                <p>${item.weather[0].main}</p>

                <h3>${convertTemperature(item.main.temp)}</h3>
            `;

            dailyForecast.appendChild(card);

        });

    }

    catch (error) {

        console.error("Daily Forecast Error:", error);

    }

}
// =========================================
// SkyPulse Weather Pro
// Part 3
// AQI + AQI Bar + Initialization
// =========================================

// ---------- AQI ----------

async function getAQI(lat, lon) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );

        const data = await response.json();

        if (!data.list || data.list.length === 0) return;

        const aqi = data.list[0].main.aqi;

        const aqiText = document.getElementById("aqi");
        const aqiFill = document.getElementById("aqiFill");

        let text = "";
        let width = "";
        let color = "";

        switch (aqi) {

            case 1:
                text = "Good";
                width = "20%";
                color = "#00c853";
                break;

            case 2:
                text = "Fair";
                width = "40%";
                color = "#64dd17";
                break;

            case 3:
                text = "Moderate";
                width = "60%";
                color = "#ffd600";
                break;

            case 4:
                text = "Poor";
                width = "80%";
                color = "#ff9100";
                break;

            case 5:
                text = "Very Poor";
                width = "100%";
                color = "#d50000";
                break;

            default:
                text = "--";
                width = "0%";
                color = "#ffffff";

        }

        aqiText.textContent = text;

        if (aqiFill) {

            aqiFill.style.width = width;
            aqiFill.style.background = color;

        }

    }

    catch (error) {

        console.error("AQI Error:", error);

    }

}

// ---------- Auto Load ----------

window.addEventListener("load", () => {

    updateDateTime();

    if (navigator.geolocation) {

        getLocation();

    }

});

// ---------- Search Button ----------

const searchBtn = document.getElementById("searchBtn");

if (searchBtn) {

    searchBtn.addEventListener("click", getWeather);

}

// ---------- GPS Button ----------

const locationBtn = document.getElementById("locationBtn");

if (locationBtn) {

    locationBtn.addEventListener("click", getLocation);

}

// ---------- Input Focus ----------

const cityField = document.getElementById("city");

if (cityField) {

    cityField.focus();

}

// =========================================
// End of SkyPulse Weather Pro
// =========================================