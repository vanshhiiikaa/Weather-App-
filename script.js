const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherIcon = document.getElementById("weather-icon");
const errorMessage = document.getElementById("error-message");
const weatherInfo = document.getElementById("weather-info");

// Weather code descriptions from Open-Meteo
function getWeatherDetails(code) {
    if (code === 0) {
        return { text: "Clear Sky", icon: "☀️" };
    } else if (code === 1) {
        return { text: "Mainly Clear", icon: "🌤️" };
    } else if (code === 2) {
        return { text: "Partly Cloudy", icon: "⛅" };
    } else if (code === 3) {
        return { text: "Overcast", icon: "☁️" };
    } else if ([45, 48].includes(code)) {
        return { text: "Foggy", icon: "🌫️" };
    } else if ([51, 53, 55, 56, 57].includes(code)) {
        return { text: "Drizzle", icon: "🌦️" };
    } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { text: "Rainy", icon: "🌧️" };
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { text: "Snowy", icon: "❄️" };
    } else if ([95, 96, 99].includes(code)) {
        return { text: "Thunderstorm", icon: "⛈️" };
    }

    return { text: "Weather Unavailable", icon: "🌍" };
}

// Search city and fetch weather data
async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    errorMessage.textContent = "";
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";

    try {
        // Find the city's geographical coordinates
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the name.");
        }

        const place = geoData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;

        // Fetch current weather
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        if (!current) {
            throw new Error("Weather data is unavailable.");
        }

        // Get weather description and icon
        const details = getWeatherDetails(current.weather_code);

        // Display the results
        cityName.textContent = `${place.name}, ${place.country}`;
        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;

        description.textContent = details.text;
        weatherIcon.textContent = details.icon;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;

        // Change icon for clear weather at night
        if (current.is_day === 0 && current.weather_code === 0) {
            weatherIcon.textContent = "🌙";
        }

        weatherInfo.style.display = "block";
        errorMessage.textContent = "";

    } catch (error) {
        weatherInfo.style.display = "none";
        showError(error.message || "Something went wrong. Please try again.");
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

// Display error messages
function showError(message) {
    errorMessage.textContent = message;
}

// Search button click
searchBtn.addEventListener("click", getWeather);

// Allow searching by pressing Enter
cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Hide weather details until a city is searched
weatherInfo.style.display = "none";
