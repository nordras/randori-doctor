// Types and Enums
export enum Role {
  Pilot = 'pilot',
  Copilot = 'copilot',
  Observer = 'observer'
}

export enum RoomStatus {
  Active = 'active',
  Finished = 'finished'
}

export interface Participant {
  id: string;
  name: string;
  slackHandle: string;
  currentRoomId: string;
  role: Role;
  position: number;
}

export interface Leader {
  id: string;
  name: string;
  slackHandle: string;
  roomId: string;
  zoomLink: string;
}

export interface Room {
  id: string;
  name: string;
  leaderId: string;
  participants: string[];
  status: RoomStatus;
}

export interface Session {
  currentRound: number;
  startTime: Date;
  endTime: Date | null;
  isRunning: boolean;
}

// Mock data generator
export function generateMockData() {
  const rooms: Room[] = Array(6).fill(0).map((_, index) => ({
    id: `room-${index + 1}`,
    name: `Room ${index + 1}`,
    leaderId: `leader-${index + 1}`,
    participants: [],
    status: RoomStatus.Active
  }));

  const leaders: Leader[] = Array(6).fill(0).map((_, index) => ({
    id: `leader-${index + 1}`,
    name: `Leader ${index + 1}`,
    slackHandle: `@leader${index + 1}`,
    roomId: `room-${index + 1}`,
    zoomLink: `https://zoom.us/j/meeting${index + 1}`
  }));

  const participants: Participant[] = [];

  rooms.forEach((room, roomIndex) => {
    for (let i = 0; i < 5; i++) {
      const participantId = `participant-${roomIndex * 5 + i + 1}`;
      let role: Role = Role.Observer;
      if (i === 0) role = Role.Pilot;
      if (i === 1) role = Role.Copilot;

      participants.push({
        id: participantId,
        name: `Participant ${roomIndex * 5 + i + 1}`,
        slackHandle: `@participant${roomIndex * 5 + i + 1}`,
        currentRoomId: room.id,
        role,
        position: i
      });

      room.participants.push(participantId);
    }
  });

  return { rooms, leaders, participants };
}

// Helper functions
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getRoleColor(role: Role): string {
  switch (role) {
    case Role.Pilot:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case Role.Copilot:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case Role.Observer:
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

export function getRoleBadgeVariant(role: Role): 'default' | 'outline' | 'secondary' | 'destructive' {
  switch (role) {
    case Role.Pilot:
      return 'default';
    case Role.Copilot:
      return 'secondary';
    case Role.Observer:
    default:
      return 'outline';
  }
}
