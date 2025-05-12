const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    avatar: { type: String, default: '/uploads/avatars/default.jpg' }

  },
  { timestamps: true }
);


module.exports = mongoose.model('User', userSchema);
