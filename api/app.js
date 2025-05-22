const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sessionRoutes = require("./routes/sessionRoutes");
const sessionSocket = require("./sockets/sessionSocket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use((req, res, next) => {
  req.io = io; // para emitir eventos nos controllers
  next();
});

app.use("/api/session", sessionRoutes);

sessionSocket(io);

module.exports = server;
