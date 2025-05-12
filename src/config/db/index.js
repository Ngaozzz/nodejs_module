const mongoose = require('mongoose');
require('dotenv').config(); // Đảm bảo nạp biến môi trường tại đây

async function Connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = { Connect };
