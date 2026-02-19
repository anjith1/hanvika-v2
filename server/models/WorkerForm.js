// models/WorkerForm.js — uses the single shared DB connection from db.js
const mongoose = require("mongoose");
const { conn } = require("../db");

const workerFormSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  workerTypes: {
    acRepair: { type: Boolean, default: false },
    mechanicRepair: { type: Boolean, default: false },
    electricalRepair: { type: Boolean, default: false },
    electronicRepair: { type: Boolean, default: false },
    plumber: { type: Boolean, default: false },
    packersMovers: { type: Boolean, default: false },
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  costPerHour: {
    type: String,
    required: false,
    default: "",
  },
  profilePhoto: {
    data: Buffer,
    contentType: String,
  },
});

// Collection name: "workerforms" (Mongoose default for this model)
module.exports = conn.model("WorkerForm", workerFormSchema, "workerforms");
