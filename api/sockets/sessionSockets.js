const session = require("../controllers/sessionController");

function sessionSocket(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("sessionState", session.getState());

    socket.on("requestState", () => {
      socket.emit("sessionState", session.getState());
    });

    socket.on("undo", () => {
      // aplicar lógica de undo
    });

    socket.on("redo", () => {
      // aplicar lógica de redo
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = sessionSocket;
