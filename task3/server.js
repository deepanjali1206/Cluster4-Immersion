const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Vehicle = require("./models/Vehicle");

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

mongoose
  .connect("mongodb://localhost:27017/vehicles")
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error("Connection error", err));

app.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.render("index", { vehicles: vehicles });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/vehicles", async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.redirect("/vehicles");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/vehicles/:id/edit", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    res.render("edit", { vehicle: vehicle });
  } catch (err) {
    res.status(404).send("Vehicle not found");
  }
});

app.put("/vehicles/:id", async (req, res) => {
  try {
    await Vehicle.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/vehicles");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete("/vehicles/:id", async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.redirect("/vehicles");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
