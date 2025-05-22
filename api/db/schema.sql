CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currentRound INTEGER,
  startTime TEXT,
  endTime TEXT,
  isRunning BOOLEAN
);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT
);

CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  name TEXT,
  currentRoomId TEXT,
  role TEXT,
  position INTEGER
);
