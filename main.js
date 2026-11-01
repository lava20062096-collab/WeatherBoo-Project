
const statusText = document.getElementById("status");

let timeInterval;

// FAVOURITE CITIES

let favouriteCities = JSON.parse(
    localStorage.getItem("weatherBooFavourites")
) || [];

function saveFavourites() {
    localStorage.setItem(
        "weatherBooFavourites",
        JSON.stringify(favouriteCities)
    );
}

function displayFavourites() {

    const favouriteList = document.getElementById("favouriteList");

    favouriteList.innerHTML = "";

    if (favouriteCities.length === 0) {
        favouriteList.innerHTML =
            "<p>No favourite cities yet. 💗</p>";
        return;
    }

    favouriteCities.forEach((city, index) => {

        const item = document.createElement("div");

        item.className = "favourite-item";

        item.innerHTML = `
            <button onclick="loadFavourite(${index})">
                📍 ${city.name}
            </button>

            <button onclick="removeFavourite(${index})">
                ❌
            </button>
        `;

        favouriteList.appendChild(item);

    });
}

function addFavourite() {

    if (!currentCity) return;

    const alreadyAdded = favouriteCities.some(
        city => city.name === currentCity.name
    );

    if (alreadyAdded) {
        alert("This city is already in your favourites! 💗");
        return;
    }

    favouriteCities.push(currentCity);

    saveFavourites();
    displayFavourites();

    alert("City added to favourites! ⭐");
}

function removeFavourite(index) {

    favouriteCities.splice(index, 1);

    saveFavourites();
    displayFavourites();
}

function loadFavourite(index) {

    const city = favouriteCities[index];

    getWeather(
        city.latitude,
        city.longitude,
        city.name
    );
}

let currentCity = null;

displayFavourites();

// WEATHER CONDITION DETAILS

function getWeatherInfo(code, isDay) {

    if (code === 0) {
        return isDay
            ? { icon: "☀️", text: "Clear Sky" }
            : { icon: "🌙", text: "Clear Night" };
    }

    if (code === 1) return { icon: "🌤️", text: "Mainly Clear" };
    if (code === 2) return { icon: "⛅", text: "Partly Cloudy" };
    if (code === 3) return { icon: "☁️", text: "Overcast" };

    if (code === 45 || code === 48) {
        return { icon: "🌫️", text: "Foggy" };
    }

    if (code >= 51 && code <= 57) {
        return { icon: "🌦️", text: "Drizzle" };
    }

    if (code >= 61 && code <= 67) {
        return { icon: "🌧️", text: "Rain" };
    }

    if (code >= 71 && code <= 77) {
        return { icon: "❄️", text: "Snow" };
    }

    if (code >= 80 && code <= 82) {
        return { icon: "🌧️", text: "Rain Showers" };
    }

    if (code === 85 || code === 86) {
        return { icon: "🌨️", text: "Snow Showers" };
    }

    if (code >= 95 && code <= 99) {
        return { icon: "⛈️", text: "Thunderstorm" };
    }

    return { icon: "🌤️", text: "Weather" };
}


// DRESS SUGGESTION BASED ON ACTUAL WEATHER

function suggestOutfit(temp, code, isDay) {

    let outfit;

    if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82) ||
        (code >= 95 && code <= 99)
    ) {
        outfit = {
            title: "Rainy Day Look! 🌧️",
            icon: "🧥🌂👢",
            description: "Rainy weather! Choose comfortable clothes that can handle the rain.",
            tips: ["🧥 Raincoat", "🌂 Umbrella", "👢 Waterproof shoes"],
            dialogue: "Bestieee! It's going to rain! Don't forget your umbrella. We don't want you looking like a wet chicken! 😂"
        };    
    }

    else if (code >= 71 && code <= 77 || code === 85 || code === 86) {
        outfit = {
            title: "Snowy Day Look! ❄️",
            icon: "🧥🧣🧤",
            description: "Keep yourself warm with layers of comfortable winter clothing.",
            tips: ["🧥 Winter jacket", "🧣 Scarf", "🧤 Gloves"],
            dialogue: "Oh no, bestie! It's freezing outside! Wear your sweater, or you'll turn into an ice cube! 🥶"
        };
    }

    else if (temp < 20) {
        outfit = {
            title: "Cozy Winter Look! 🧣",
            icon: "🧥🧣👖",
            description: "A warm sweater with jeans and comfortable shoes.",
            tips: ["🧥 Sweater", "🧣 Scarf", "👟 Shoes"],
            dialogue: "It's a little chilly, bestie! Dress warmly and stay cozy. Your health comes first! 💗"
        };
    }

    else if (temp >= 30) {
        outfit = {
            title: "Sunny Day Look! ☀️",
            icon: "👗🕶️👒",
            description: "Wear breathable cotton clothes to stay cool in the hot weather.",
            tips: ["👗 Cotton dress", "🕶️ Sunglasses", "👒 Cap"],
            dialogue: "It's super sunny today, bestie! Wear something cotton and don't forget your water bottle! ☀️"
        };
    }

    else if (code === 45 || code === 48 || code === 3) {
        outfit = {
            title: "Cloudy Day Look! ☁️",
            icon: "👚👖👟",
            description: "A cute casual outfit with a light jacket for changing weather.",
            tips: ["👚 Casual top", "👖 Jeans", "🧥 Light jacket"],
            dialogue: "The sky is looking cloudy today! Get ready in a cute and comfy outfit, bestie! 😍"
        };
    }

    else {
        outfit = {
            title: "Perfect Day Look! 🌸",
            icon: "👗👜👟",
            description: "A comfortable cotton outfit with your favourite accessories.",
            tips: ["👗 Cotton outfit", "👜 Handbag", "👟 Sneakers"],
            dialogue: "The weather is lovely today! Wear your favourite outfit and have a beautiful day, bestie! 💕"
        };
    }

    if (!isDay) {
        outfit.dialogue += " It's evening, bestie! Carry a light jacket with you!";
    }

    return outfit;
}


// GET WEATHER FROM OPEN-METEO API

async function getWeather(latitude, longitude, city) {

    statusText.textContent = "Getting live weather... ☁️";

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather data unavailable");
        }

        const data = await response.json();

        const current = data.current;

        // CURRENT WEATHER

        const weather = getWeatherInfo(
            current.weather_code,
            current.is_day
        );

        document.getElementById("cityName").textContent = city;

        currentCity = {
        name: city,
        latitude: latitude,
        longitude: longitude
        };

        const cityTimeZone = data.timezone;

function updateCurrentTime() {
    const now = new Date();

    const date = new Intl.DateTimeFormat("en-IN", {
        timeZone: cityTimeZone,
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(now);

    const time = new Intl.DateTimeFormat("en-IN", {
        timeZone: cityTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).format(now);

    document.getElementById("currentTime").textContent =
        "Local time: " + date + " | " + time;
}

updateCurrentTime();

if (timeInterval) {
    clearInterval(timeInterval);
}

timeInterval = setInterval(updateCurrentTime, 1000);
        document.getElementById("weatherIcon").textContent =
            weather.icon;

        document.getElementById("temperature").textContent =
            Math.round(current.temperature_2m) + "°C";

        document.getElementById("condition").textContent =
            weather.text;

        document.getElementById("feelsLike").textContent =
            Math.round(current.apparent_temperature) + "°C";

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m + "%";

        document.getElementById("wind").textContent =
            current.wind_speed_10m + " km/h";


        // AUTOMATIC DRESS SUGGESTION

        const outfit = suggestOutfit(
            current.temperature_2m,
            current.weather_code,
            current.is_day
        );

        document.getElementById("outfitTitle").textContent =
            outfit.title;

        document.getElementById("outfitIcon").textContent =
            outfit.icon;

        document.getElementById("outfitDescription").textContent =
            outfit.description;

        document.getElementById("buddyDialogue").textContent =
            outfit.dialogue;

        document.getElementById("outfitTips").innerHTML =
            outfit.tips.map(tip => `<span>${tip}</span>`).join("");


        // 7-DAY FORECAST

        displayForecast(data.daily);

        // RAIN ALERT

        const rainChance = data.daily.precipitation_probability_max[0];

        const rainAlert = document.getElementById("rainAlert");

            if (rainChance === null || rainChance === undefined) {

            rainAlert.textContent =
                    "Rain information is currently unavailable.";

            }
            else if (rainChance >= 60) {

                rainAlert.textContent =
                `☔ Rain Alert! There is a ${rainChance}% chance of rain today. Don't forget your umbrella!`;

            }
            else if (rainChance >= 30) {

            rainAlert.textContent =
                `🌦️ Rain is possible today (${rainChance}% chance). Carry an umbrella just in case!`;

            }
            else {

                rainAlert.textContent =
                    `☀️ Only ${rainChance}% chance of rain today. Enjoy your day! 💗`;

            }

                statusText.textContent = "Live weather updated successfully! 💗";

    }

    catch (error) {

        statusText.textContent =
            "Unable to get weather. Please try again.";

        console.error(error);
    }
}


// DISPLAY 7-DAY FORECAST

function displayForecast(daily) {

    const forecastList = document.getElementById("forecastList");

    forecastList.innerHTML = "";

    daily.time.forEach((date, index) => {

        const day = new Date(date + "T12:00:00");

        const dayName = day.toLocaleDateString("en-IN", {
            weekday: "short"
        });

        const weather = getWeatherInfo(
            daily.weather_code[index],
            1
        );

        const maxTemp = Math.round(
            daily.temperature_2m_max[index]
        );

        const minTemp = Math.round(
            daily.temperature_2m_min[index]
        );

        const rainChance =
            daily.precipitation_probability_max[index];

        const item = document.createElement("div");

        item.className = "forecast-item";

        item.innerHTML = `
            <p>${dayName}</p>
            <span>${weather.icon}</span>
            <strong>${maxTemp}° / ${minTemp}°</strong>
            <small>${rainChance ?? "--"}% rain</small>
        `;

        forecastList.appendChild(item);

    });
}


// SEARCH ANY CITY

async function searchCity() {

    const city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        alert("Please enter a city name!");
        return;
    }

    statusText.textContent = "Searching for your city...";

    try {

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(geoURL);

        if (!response.ok) {
            throw new Error("City search failed");
        }

        const geoData = await response.json();

        if (!geoData.results || geoData.results.length === 0) {
            statusText.textContent = "City not found. Try another city.";
            return;
        }

        const place = geoData.results[0];

        await getWeather(
            place.latitude,
            place.longitude,
            place.name + ", " + (place.country || "")
        );

    }

    catch (error) {

        statusText.textContent = "Unable to search city. Try again.";

        console.error(error);
    }
}


// GET CURRENT LOCATION

function getLocation() {

    if (!navigator.geolocation) {
        statusText.textContent =
            "Your browser does not support location.";
        return;
    }

    statusText.textContent =
        "Please allow location permission... 📍";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            getWeather(latitude, longitude, "My Current Location");
        },

        function(error) {

            statusText.textContent =
                "Location permission denied. You can search your city instead.";

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }

    );
}


// SEARCH WHEN ENTER KEY IS PRESSED

document.getElementById("cityInput").addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchCity();
    }

});
