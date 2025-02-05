import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  city: string;
  date: string;
  iconDescription: string;
  humidity: number;
  icon: string;
  tempF: number;
  windSpeed: number;

  constructor(
    city: string,
    date: string,
    iconDescription: string,
    humidity: number,
    icon: string,
    tempF: number,
    windSpeed: number
  ) {
    this.city = city;
    this.date = date;
    this.iconDescription = iconDescription;
    this.humidity = humidity;
    this.icon = icon;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
  }
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName = "";

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || '';
  }

  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    const data = await response.json();
    return data[0]; // Return first result from location API
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon
    };
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    return await response.json();
  }

  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      response.name,
      new Date(response.dt * 1000).toLocaleDateString(),
      response.weather[0].description,
      response.main.humidity,
      response.weather[0].icon,
      ((response.main.temp - 273.15) * 9) / 5 + 32, // Convert from Kelvin to Fahrenheit
      response.wind.speed
    );
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecast: Weather[] = [currentWeather];

    if (weatherData.length > 0) {
      for (const item of weatherData) {
        forecast.push(
          new Weather(
            currentWeather.city,
            new Date(item.dt * 1000).toLocaleDateString(),
            item.weather[0].description,
            item.main.humidity,
            item.weather[0].icon,
            ((item.main.temp - 273.15) * 9) / 5 + 32, // Convert to Fahrenheit
            item.wind.speed
          )
        );
      }
    }

    return forecast;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      this.cityName = city;

      // Get coordinates of the city
      const coordinates = await this.fetchAndDestructureLocationData();

      // Fetch weather data using coordinates
      const weatherData = await this.fetchWeatherData(coordinates);

      // Parse the current weather
      const currentWeather = this.parseCurrentWeather(weatherData);

      // Build forecast array (if extended forecast is available)
      return this.buildForecastArray(currentWeather, []);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }
}

export default new WeatherService();
