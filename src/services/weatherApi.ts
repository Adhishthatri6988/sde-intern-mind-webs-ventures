import { format, subDays, addDays } from 'date-fns';
import { WeatherData } from '../types/types'

const API_BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;


export const fetchTemperatureData = async (lat: number, lon: number): Promise<WeatherData> => {
  if (!API_BASE_URL) {
    throw new Error("VITE_WEATHER_API_BASE_URL is not defined in the .env file.");
  }

  const today = new Date();
  const startDate = format(subDays(today, 15), 'yyyy-MM-dd');
  const endDate = format(addDays(today, 15), 'yyyy-MM-dd');

  // Construct the API URL with the provided coordinates
  const API_URL = `${API_BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    throw error;
  }
};
