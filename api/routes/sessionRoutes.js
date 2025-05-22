const express = require("express");
const router = express.Router();
const session = require("../controllers/sessionController");

router.post("/start", (req, res) => {
  session.startSession();
  res.json({ message: "Session started" });
});

router.post("/pause", (req, res) => {
  session.pauseSession();
  res.json({ message: "Session paused" });
});

router.post("/reset", (req, res) => {
  session.resetTimer();
  res.json({ message: "Timer reset" });
});

router.post("/advance", (req, res) => {
  session.advanceRound(req.io); // passando io para emitir
  res.json({ message: "Advanced to next round" });
});

module.exports = router;
