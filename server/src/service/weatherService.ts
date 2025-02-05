import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
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
// TODO: Complete the WeatherService class
class WeatherService {
  
  private baseURL: string;
  private apiKey: string;
  private cityName = "";
 
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }
  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    const data = await response.json();
    return data[0];
  }
 
  private destructureLocationData(locationData: Coordinates): Coordinates {
  const { lat, lon } = locationData;
  const coordinates: Coordinates = { lat, lon };
  return coordinates;
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    const data = await response.json();
  
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const weather = new Weather(
      response.name,
      new Date(response.dt * 1000).toLocaleDateString(),
      response.weather[0].description,
      response.main.humidity,
      response.weather[0].icon,
      ((response.main.temp - 273.15) * 9) / 5 + 32,
      response.wind.speed
    );
    return weather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = this.fetchAndDestructureLocationData();
    const weatherData = this.fetchWeatherData(coordinates);
    return weatherData;

  }
}

export default new WeatherService();
