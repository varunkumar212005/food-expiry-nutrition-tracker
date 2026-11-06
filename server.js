require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: "Other" },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, default: 1, min: 0 },
  calories: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Food = mongoose.model("Food", foodSchema);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Food tracker API is running" });
});

app.get("/api/foods", async (req, res) => {
  try {
    const foods = await Food.find().sort({ expiryDate: 1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve food items" });
  }
});

app.post("/api/foods", async (req, res) => {
  try {
    const { name, category, expiryDate, quantity, calories, notes } = req.body;
    if (!name || !expiryDate) {
      return res.status(400).json({ message: "Food name and expiry date are required" });
    }
    const food = await Food.create({
      name, category, expiryDate, quantity, calories, notes
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ message: "Invalid food details" });
  }
});

app.delete("/api/foods/:id", async (req, res) => {
  try {
    const deleted = await Food.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Food item not found" });
    res.json({ message: "Food item deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid food item ID" });
  }
});

app.get("/api/summary", async (req, res) => {
  try {
    const foods = await Food.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soon = new Date(today);
    soon.setDate(soon.getDate() + 3);

    const expired = foods.filter(item => new Date(item.expiryDate) < today).length;
    const expiringSoon = foods.filter(item => {
      const date = new Date(item.expiryDate);
      return date >= today && date <= soon;
    }).length;

    res.json({
      totalItems: foods.length,
      expired,
      expiringSoon,
      safe: foods.length - expired - expiringSoon
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create summary" });
  }
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI is missing. Add it to .env before starting the app.");
      app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT} (database not connected)`));
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
