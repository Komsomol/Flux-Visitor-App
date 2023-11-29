import express from "express";

export const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Flux Visitor App",
    message: "Please enter your information below.",
    showForm: true,
  });
});