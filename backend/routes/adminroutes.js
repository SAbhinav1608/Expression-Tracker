const express = require('express');
const router = express.Router();
// Make sure to import your new Note model
const Note = require("../models/Note");
// Import your admin authentication middleware
const authenticateAdmin = require("../middleware/authenticateAdmin");

// --- 1. GET: To fetch all notes for a child ---
// This is what fires when you open the "Notes" tab
router.get(
  "/child/:childId/notes",
  authenticateAdmin, // Protect the route
  async (req, res) => {
    try {
      const notes = await Note.find({ childId: req.params.childId })
        .sort({ createdAt: -1 }); // Sort newest first

      res.status(200).json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Server error while fetching notes." });
    }
  }
);

// --- 2. POST: To save a new note ---
// This is what fires when you click "Save Note"
router.post(
  "/child/:childId/notes",
  authenticateAdmin, // Protect the route
  async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ message: "Note text is required." });
      }

      const newNote = new Note({
        text,
        childId: req.params.childId,
        adminId: req.admin._id, // Fixed: use _id from Mongoose document
        adminName: req.admin.name || "Admin", // Fallback to 'Admin'
      });

      await newNote.save();

      // Send the newly created note back to the frontend
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Error saving note:", error);
      res.status(500).json({ message: "Server error while saving note." });
    }
  }
);

module.exports = router;