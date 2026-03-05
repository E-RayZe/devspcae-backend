const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed', error);
    process.exit(1);
  }
};

module.exports = connectDB;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmUzOGFmNWVjNGQyOTNhYzg5OGI5MSIsImlhdCI6MTc2OTI3NDIzNiwiZXhwIjoxNzY5ODc5MDM2fQ.rKi3O-0qGqkhK4Pj-xsgR2CIvxXnzN9EJO97rBX4O9A