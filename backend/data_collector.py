import requests
import pandas as pd
from datetime import datetime, timedelta
import time
import os
from dotenv import load_dotenv

load_dotenv()

class DataCollector:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.base_url = os.getenv('NODE_SERVER_URL', 'http://localhost:5000')
        
    def collect_weather_data(self, lat=11.9340, lng=79.8300):
        """Collect current weather data for Pondicherry"""
        try:
            if not self.api_key:
                # Return mock data if no API key
                return {
                    'temperature': 28 + (datetime.now().hour - 12) * 2,
                    'humidity': 65 + (datetime.now().hour - 12),
                    'visibility': 10 if datetime.now().hour >= 6 and datetime.now().hour <= 18 else 5,
                    'precipitation': 0 if datetime.now().hour < 18 else 0.2,
                    'weather': 'clear' if datetime.now().hour >= 6 and datetime.now().hour <= 18 else 'cloudy'
                }
            
            url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={self.api_key}&units=metric"
            response = requests.get(url)
            data = response.json()
            
            return {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
                'precipitation': data.get('rain', {}).get('1h', 0),
                'weather': data['weather'][0]['main'].lower()
            }
        except Exception as e:
            print(f"Weather data collection error: {e}")
            return self.get_fallback_weather_data()
    
    def get_fallback_weather_data(self):
        """Fallback weather data based on time of day"""
        hour = datetime.now().hour
        return {
            'temperature': 25 + (hour - 12) * 1.5,
            'humidity': 60 + (hour - 12),
            'visibility': 8 if 6 <= hour <= 18 else 4,
            'precipitation': 0 if hour < 20 else 0.1,
            'weather': 'clear' if 6 <= hour <= 18 else 'cloudy'
        }
    
    def collect_historical_incidents(self, zone, days=30):
        """Collect historical incident data for a zone"""
        try:
            response = requests.get(f"{self.base_url}/api/emergencies/analytics/stats")
            data = response.json()
            
            # Calculate incidents for this zone (simplified)
            zone_incidents = {
                'whiteTown': 2,
                'promenade': 5,
                'rockBeach': 3,
                'heritageTown': 8,
                'industrialArea': 12,
                'marketArea': 6
            }.get(zone, 3)
            
            return zone_incidents
        except:
            return 3  # Fallback value
    
    def collect_police_presence(self, zone):
        """Estimate police presence based on zone characteristics"""
        presence_map = {
            'whiteTown': 7,
            'promenade': 8,
            'rockBeach': 6,
            'heritageTown': 7,
            'industrialArea': 4,
            'marketArea': 8
        }
        return presence_map.get(zone, 5)
    
    def collect_population_density(self, zone, hour):
        """Estimate population density based on zone and time"""
        base_density = {
            'whiteTown': 80,
            'promenade': 60,
            'rockBeach': 40,
            'heritageTown': 70,
            'industrialArea': 20,
            'marketArea': 90
        }.get(zone, 50)
        
        # Adjust for time of day
        if 9 <= hour <= 11 or 17 <= hour <= 19:  # Peak hours
            return min(100, base_density + 20)
        elif 0 <= hour <= 5:  # Late night
            return max(10, base_density - 40)
        else:
            return base_density
    
    def collect_lighting_index(self, zone, hour):
        """Estimate lighting conditions"""
        if 6 <= hour <= 18:  # Daylight
            return 10
        
        base_lighting = {
            'whiteTown': 8,
            'promenade': 9,
            'rockBeach': 4,
            'heritageTown': 6,
            'industrialArea': 3,
            'marketArea': 7
        }.get(zone, 5)
        
        return base_lighting

# Global data collector instance
data_collector = DataCollector()
