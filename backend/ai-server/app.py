from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import json
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

class SafetyPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'hour', 'day_of_week', 'latitude', 'longitude',
            'temperature', 'humidity', 'visibility', 'precipitation',
            'historical_incidents', 'police_presence', 'lighting_index',
            'population_density', 'daylight'
        ]
        self.load_or_train_model()
    
    def load_or_train_model(self):
        try:
            self.model = joblib.load('ml_model/safety_model.pkl')
            self.scaler = joblib.load('ml_model/scaler.pkl')
            print("✅ AI Model loaded successfully")
        except:
            print("🔄 Training new AI model...")
            self.train_initial_model()
    
    def train_initial_model(self):
        # Generate synthetic training data based on Pondicherry patterns
        training_data = self.generate_training_data()
        
        X = training_data[self.feature_names]
        y = training_data['safety_score']
        
        # Split and scale data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train Random Forest model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Save model
        os.makedirs('ml_model', exist_ok=True)
        joblib.dump(self.model, 'ml_model/safety_model.pkl')
        joblib.dump(self.scaler, 'ml_model/scaler.pkl')
        
        print("✅ AI Model trained and saved successfully")
    
    def generate_training_data(self):
        # This would be replaced with real Pondicherry data
        # For now, generating synthetic data based on known patterns
        n_samples = 10000
        data = []
        
        for _ in range(n_samples):
            hour = np.random.randint(0, 24)
            day_of_week = np.random.randint(0, 7)
            lat = 11.91 + np.random.random() * 0.05  # Pondicherry bounds
            lng = 79.78 + np.random.random() * 0.07
            
            # Base safety score with realistic patterns
            base_score = 70
            
            # Time adjustments
            if 6 <= hour <= 18:  # Daytime
                base_score += 15
            else:  # Nighttime
                base_score -= 20
            
            # Weekend effect
            if day_of_week >= 5:  # Weekend
                base_score -= 10
            
            # Area-based adjustments
            if 11.93 <= lat <= 11.94 and 79.82 <= lng <= 79.84:  # White Town
                base_score += 10
            elif 11.94 <= lat <= 11.96 and 79.79 <= lng <= 79.81:  # Industrial
                base_score -= 25
            
            # Add noise and ensure bounds
            safety_score = max(0, min(100, base_score + np.random.normal(0, 10)))
            
            data.append({
                'hour': hour,
                'day_of_week': day_of_week,
                'latitude': lat,
                'longitude': lng,
                'temperature': 25 + np.random.normal(0, 5),
                'humidity': 60 + np.random.normal(0, 20),
                'visibility': 8 + np.random.random() * 2,
                'precipitation': np.random.exponential(0.5),
                'historical_incidents': np.random.poisson(2),
                'police_presence': np.random.randint(1, 10),
                'lighting_index': np.random.randint(1, 10),
                'population_density': np.random.randint(1, 100),
                'daylight': 1 if 6 <= hour <= 18 else 0,
                'safety_score': safety_score
            })
        
        return pd.DataFrame(data)
    
    def predict_safety(self, features):
        try:
            # Prepare features
            feature_array = np.array([[
                features.get('hour', 12),
                features.get('day_of_week', 0),
                features.get('latitude', 11.9340),
                features.get('longitude', 79.8300),
                features.get('temperature', 27),
                features.get('humidity', 70),
                features.get('visibility', 9),
                features.get('precipitation', 0),
                features.get('historical_incidents', 2),
                features.get('police_presence', 5),
                features.get('lighting_index', 7),
                features.get('population_density', 50),
                features.get('daylight', 1)
            ]])
            
            # Scale features and predict
            scaled_features = self.scaler.transform(feature_array)
            prediction = self.model.predict(scaled_features)[0]
            
            return max(0, min(100, prediction))
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return 50  # Fallback score

# Initialize predictor
predictor = SafetyPredictor()

@app.route('/predict', methods=['POST'])
def predict_safety():
    try:
        data = request.json
        features = data.get('features', {})
        
        # Add current time features
        now = datetime.now()
        features['hour'] = now.hour
        features['day_of_week'] = now.weekday()
        
        # Get prediction
        safety_score = predictor.predict_safety(features)
        
        # Calculate confidence based on feature completeness
        confidence = min(0.95, 0.5 + (len(features) / len(predictor.feature_names)) * 0.5)
        
        return jsonify({
            'safety_score': round(safety_score, 1),
            'confidence': round(confidence, 2),
            'timestamp': datetime.now().isoformat(),
            'risk_factors': analyze_risk_factors(features, safety_score)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def analyze_risk_factors(features, safety_score):
    factors = []
    
    hour = features.get('hour', 12)
    if hour < 6 or hour > 20:
        factors.append('night_time')
    
    if features.get('precipitation', 0) > 2:
        factors.append('bad_weather')
    
    if features.get('lighting_index', 5) < 4:
        factors.append('poor_lighting')
    
    if features.get('historical_incidents', 0) > 5:
        factors.append('high_incident_area')
    
    return factors

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor.model is not None,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
