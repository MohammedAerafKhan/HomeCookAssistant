const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mealSchema = new mongoose.Schema({
  Breakfast: { type: String },
  Lunch: { type: String },
  Dinner: { type: String },
}, { _id: false });

const instructionSchema = new mongoose.Schema({
  Breakfast: { type: String },
  Lunch: { type: String },
  Dinner: { type: String },
}, { _id: false });

const groceryItemSchema = new mongoose.Schema({
  item: String,
  quantity: String,
}, { _id: false });

const weekSchema = new mongoose.Schema({
  startDate: { type: Date },
  plan: [mealSchema],
  instructions: {
    type: Map,
    of: instructionSchema,
    default: {}
  },
  groceryList: {
    type: Map,
    of: [groceryItemSchema],
    default: {}
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: { type: String, default: 'free' },
  quizData: {
    gender: String,
    height: String,
    weight: String,
    age: String,
    reason: String,
    mealType: String,
    skillLevel: String,
    mealsPerDay: [String],
    restrictions: [String],
    cuisine: [String],
  },
  mealPlan: [mealSchema],
  mealHistory: [weekSchema],
  instructions: {
    type: Map,
    of: instructionSchema,
    default: {}
  },
  groceryList: {
    type: Map,
    of: [groceryItemSchema],
    default: {}
  },
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);