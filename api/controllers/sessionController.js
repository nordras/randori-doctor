let interval = null;
const ROUND_DURATION = 130;
let timer = ROUND_DURATION;

const state = {
  session: null,
  participants: [],
  rooms: [],
  undoStack: [],
  redoStack: [],
};

function pushToHistory() {
  state.undoStack.push({
    session: { ...state.session },
    rooms: JSON.parse(JSON.stringify(state.rooms)),
    participants: JSON.parse(JSON.stringify(state.participants)),
  });
  state.redoStack = [];
}

function startSession() {
  state.session.isRunning = true;
  state.session.startTime = new Date().toISOString();
  startTimer();
  pushToHistory();
}

function pauseSession() {
  state.session.isRunning = false;
  clearInterval(interval);
  pushToHistory();
}

function resetTimer() {
  timer = ROUND_DURATION;
  pushToHistory();
}

function advanceRound(io) {
  rotateParticipants();
  state.session.currentRound += 1;
  timer = ROUND_DURATION;
  pushToHistory();
  io.emit("roundAdvanced", { round: state.session.currentRound });
}

function endSession(roomId) {
  // similar à lógica que você já tem, ajustando para backend
}

function rotateParticipants() {
  // sua lógica de rotação, usando `state.participants` e `state.rooms`
}

function startTimer() {
  interval = setInterval(() => {
    if (state.session.isRunning && timer > 0) {
      timer--;
    } else if (state.session.isRunning && timer === 0) {
      advanceRound(); // emit via WebSocket
    }
  }, 1000);
}

module.exports = {
  startSession,
  pauseSession,
  resetTimer,
  advanceRound,
  endSession,
  getState: () => ({ ...state, timer }),
};
