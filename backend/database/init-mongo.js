// Database initialization script
db = db.getSiblingDB('safety-app');

// Create collections
db.createCollection('users');
db.createCollection('emergencies');
db.createCollection('safetydatas');
db.createCollection('responders');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "location": "2dsphere" });
db.emergencies.createIndex({ "timestamp": -1 });
db.emergencies.createIndex({ "location": "2dsphere" });
db.safetydatas.createIndex({ "location": "2dsphere" });
db.safetydatas.createIndex({ "timestamp": -1 });
db.responders.createIndex({ "currentLocation": "2dsphere" });
db.responders.createIndex({ "status": 1 });

// Insert sample data for testing
db.users.insertOne({
  email: "admin@safety.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0g7fLB.LK6c6uY7C7k6bW5JkfJvJ6cYvY6J6J6", // password: admin123
  name: "System Admin",
  phone: "+919876543210",
  userType: "admin",
  createdAt: new Date(),
  isActive: true
});

db.responders.insertOne({
  userId: null,
  authorityId: "RESP-001",
  department: "Pondicherry Police",
  rank: "officer",
  specialization: "police",
  currentLocation: {
    latitude: 11.9340,
    longitude: 79.8300,
    timestamp: new Date()
  },
  status: "available",
  isActive: true
});

print("✅ Database initialized successfully");
