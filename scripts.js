document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherDataContainer = document.getElementById('weather-data');
    const cityNameEl = document.getElementById('city-name');
    const dateEl = document.getElementById('date');
    const temperatureEl = document.getElementById('temperature');
    const descriptionEl = document.getElementById('description');
    const weatherIconImg = document.getElementById('weather-icon-img');
    const forecastCardsContainer = document.getElementById('forecast-cards');
    const loadingEl = document.getElementById('loading');
    const errorMessageEl = document.getElementById('error-message');

    // --- YOUR PERSONAL API KEY ---
    // This is your correctly implemented API key.
    const API_KEY = '2f5645e873d70f89df2d724dc51c213b'; 

    // --- Event Listeners ---
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // --- Main Functions ---
    function handleSearch() {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError("Please enter a city name.");
        }
    }

    async function getWeatherData(city) {
        // 1. Reset the UI
        showLoading();
        hideError();
        weatherDataContainer.classList.add('hidden');
        searchBtn.disabled = true;
        cityInput.disabled = true;

        try {
            // 2. Fetch Current Weather
            const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
            if (!currentResponse.ok) {
                if (currentResponse.status === 404) {
                    throw new Error(`City "${city}" not found. Check the spelling.`);
                } else if (currentResponse.status === 401) {
                    throw new Error("Your API Key is invalid. Please double-check it on the OpenWeatherMap website.");
                } else {
                    throw new Error("Could not fetch weather data. The service might be temporarily down.");
                }
            }
            const currentData = await currentResponse.json();

            // 3. Fetch Forecast
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
            const forecastData = await forecastResponse.json();

            // 4. Display Everything
            displayCurrentWeather(currentData);
            displayForecast(forecastData);
            weatherDataContainer.classList.remove('hidden');

        } catch (error) {
            showError(error.message);
        } finally {
            // 5. Always re-enable the form and hide loading spinner
            hideLoading();
            searchBtn.disabled = false;
            cityInput.disabled = false;
        }
    }

    // --- UI Display Functions ---
    function displayCurrentWeather(data) {
        cityNameEl.textContent = data.name;
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
        descriptionEl.textContent = data.weather[0].description;
        weatherIconImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    }

    function displayForecast(data) {
        forecastCardsContainer.innerHTML = '';
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
        
        dailyForecasts.forEach(forecast => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            
            const day = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const temp = `${Math.round(forecast.main.temp)}°C`;
            const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

            card.innerHTML = `<p>${day}</p><img src="${icon}" alt="Forecast"><p>${temp}</p>`;
            forecastCardsContainer.appendChild(card);
        });
    }

    // --- UI State Helpers ---
    function showLoading() { loadingEl.classList.remove('hidden'); }
    function hideLoading() { loadingEl.classList.add('hidden'); }

    function showError(message) {
        errorMessageEl.querySelector('p').textContent = message;
        errorMessageEl.classList.remove('hidden');
    }
    function hideError() { errorMessageEl.classList.add('hidden'); }
    
    // --- Initial Load ---
    // Load default city on page start
    getWeatherData('Bhubaneswar');
});

