const apiKey = 'ad6d8e0aa5msh59ff909656b310dp1049dbjsnaa9d4b7f7afc'; // Your RapidAPI key
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const suggestionsContainer = document.getElementById('suggestions');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const weatherDescription = document.getElementById('weather-description');
const temperature = document.getElementById('temperature');
const rainPercentage = document.getElementById('rain-percentage');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const body = document.body; // Get the body element to change the background

// Fetch city suggestions
cityInput.addEventListener('input', async () => {
    const query = cityInput.value;
    if (query.length > 2) {
        const cities = await getCitySuggestions(query);
        displaySuggestions(cities);
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

// Get weather data when a city is selected from suggestions or searched
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    getWeatherData(city);
});

async function getWeatherData(city) {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=7`, options);
        const data = await response.json();

        if (data.error) {
            alert(data.error.message || 'City not found. Please try again.');
            return;
        }

        // Update weather details
        cityName.textContent = data.location.name;
        weatherDescription.textContent = data.current.condition.text;
        temperature.textContent = `Temperature: ${data.current.temp_c}°C`;
        rainPercentage.textContent = `Chance of Rain: ${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
        humidity.textContent = `Humidity: ${data.current.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${data.current.wind_kph} km/h`;

        // Display the 7-day forecast and hourly forecast
        displayForecast(data.forecast.forecastday);
        displayHourlyForecast(data.forecast.forecastday[0].hour);

        // Change background based on weather condition
        changeBackground(data.current.condition.code);

        weatherInfo.style.display = 'block';
        suggestionsContainer.style.display = 'none';

    } catch (err) {
        console.error(err);
        alert('Failed to fetch weather data. Please try again later.');
    }
}

async function getCitySuggestions(query) {
    const response = await fetch(`https://api.teleport.org/api/cities/?search=${query}&limit=5`);
    const data = await response.json();
    return data._embedded['city:search-results'].map(city => city.matching_full_name);
}

function displaySuggestions(cities) {
    suggestionsContainer.innerHTML = '';
    if (cities.length > 0) {
        suggestionsContainer.style.display = 'block';
        cities.forEach(city => {
            const suggestion = document.createElement('div');
            suggestion.textContent = city;
            suggestion.addEventListener('click', () => {
                cityInput.value = city;
                suggestionsContainer.style.display = 'none';
                getWeatherData(city);
            });
            suggestionsContainer.appendChild(suggestion);
        });
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

function changeBackground(weatherCode) {
    let imageUrl = '';

    if (weatherCode === 1000) {
        imageUrl = 'clear.jpeg'; // Clear/Sunny
    } else if (weatherCode === 1003) {
        imageUrl = 'partially.jpg'; // Partly Cloudy
    } else if (weatherCode >= 1006 && weatherCode <= 1009) {
        imageUrl = 'cloudy.jpeg'; // Cloudy
    } else if (weatherCode === 1030) {
        imageUrl = 'overcast.webp'; // Overcast 
    } else if (weatherCode >= 1135 && weatherCode <= 1147) {
        imageUrl = 'mist.webp'; // Mist/Fog
    } else if (weatherCode >= 1150 && weatherCode <= 1246) {
        imageUrl = 'rain1.jpeg'; // Rain/Drizzle
    } else if (weatherCode >= 1273 && weatherCode <= 1276) {
        imageUrl = 'thunderstrom.webp'; // Thunderstorm
    } else if (weatherCode >= 1210 && weatherCode <= 1258) {
        imageUrl = 'snow.jpeg'; // Snow/Sleet
    } else if (weatherCode >= 1261 && weatherCode <= 1264) {
        imageUrl = 'hail.jpeg'; // Hail
    } else {
        imageUrl = 'default.webp'; // Default background
    }

    // Ensure this is the same folder as your HTML/JavaScript files
    body.style.backgroundImage = `url('${imageUrl}')`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
}

function displayForecast(days) {
    const weeklyForecast = document.getElementById('weekly-forecast');
    weeklyForecast.innerHTML = '';

    days.forEach(day => {
        const forecast = document.createElement('div');
        forecast.innerHTML = `
            <p>${day.date}</p>
            <p>${day.day.condition.text}</p>
            <p>Max: ${day.day.maxtemp_c}°C</p>
            <p>Min: ${day.day.mintemp_c}°C</p>
        `;
        weeklyForecast.appendChild(forecast);
    });
}

function displayHourlyForecast(hours) {
    const hourlyForecast = document.getElementById('hourly-forecast');
    hourlyForecast.innerHTML = '';

    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    hours.forEach(hour => {
        const forecastTime = new Date(hour.time);
        const hourIn12Format = formatTimeIn12Hour(forecastTime);

        if (forecastTime.getHours() >= currentHour) {
            const forecast = document.createElement('div');
            forecast.innerHTML = `
                <p>${hourIn12Format}</p>
                <p>${hour.condition.text}</p>
                <p>Temp: ${hour.temp_c}°C</p>
                <p>Chance of Rain: ${hour.chance_of_rain}%</p>
            `;
            hourlyForecast.appendChild(forecast);
        }
    });
}

function formatTimeIn12Hour(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + strMinutes + ' ' + ampm;
}
