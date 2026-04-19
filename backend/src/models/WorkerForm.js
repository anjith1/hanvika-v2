// models/WorkerForm.js — uses the single shared DB connection from db.js
// UPDATED: Replaced workerTypes boolean object with services string array
const mongoose = require("mongoose");
const { conn } = require("../db");
const SERVICES = require("../constants/services");

const workerFormSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  aadharNumber: {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: false,
    default: "",
  },
  services: {
    type: [String],
    enum: SERVICES,
    default: [],
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
