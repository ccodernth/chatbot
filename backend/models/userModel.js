// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'İsim zorunlu'],
    },
    email: {
      type: String,
      required: [true, 'Email zorunlu'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Geçersiz email formatı',
      ],
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunlu'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['guest', 'member', 'admin'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// Şifreyi kaydetmeden önce hash’le
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
