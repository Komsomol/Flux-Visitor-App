import express from "express";
import fs from "fs";
import path from "path";

export const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Flux Visitor App",
    message: "Please enter your information below.",
    showForm: true,
  });
});

router.get("/data", (req, res) => {
  fs.readFile(path.join("./data", "submissions.json"), (err, data) => {
    if (err) {
      res.status(500).json({ message: "Error reading submissions." });
    } else {
      res.json(JSON.parse(data));
    }
  });
});
