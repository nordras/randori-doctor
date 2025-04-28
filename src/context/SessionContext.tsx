import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Participant,
  Leader,
  Room,
  Session,
  Role,
  generateMockData
} from '@/lib/models';
import Logger from '@/lib/logger';

interface SessionContextProps {
  session: Session;
  rooms: Room[];
  participants: Participant[];
  leaders: Leader[];
  startSession: () => void;
  pauseSession: () => void;
  resetTimer: () => void;
  advanceRound: () => void;
  isRunning: boolean;
  timeRemaining: number;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
}

const ROUND_DURATION = 130; // 2 minutes 10 seconds

export default function SessionProvider({ children }: SessionProviderProps) {
  const { toast } = useToast();
  const [mockData] = useState(() => generateMockData());

  const [session, setSession] = useState<Session>({
    currentRound: 0,
    startTime: new Date(),
    endTime: null,
    isRunning: false
  });

  const [timeRemaining, setTimeRemaining] = useState(ROUND_DURATION);
  const [rooms, setRooms] = useState<Room[]>(mockData.rooms);
  const [participants, setParticipants] = useState<Participant[]>(mockData.participants);
  const [leaders] = useState<Leader[]>(mockData.leaders);

  // TIMER
  useEffect(() => {
    let interval: number | undefined;

    if (session.isRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && session.isRunning) {
      toast({
        title: "Round Complete",
        description: "Time's up! Advancing to the next round.",
      });
      advanceRound();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.isRunning, timeRemaining, session.currentRound]);

  const startSession = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: true }));
    toast({
      title: "Session Started",
      description: "The randori session is now in progress.",
    });
  }, []);

  const pauseSession = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: false }));
    toast({
      title: "Session Paused",
      description: "The randori session is now paused.",
    });
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(ROUND_DURATION);
    toast({
      title: "Timer Reset",
      description: "The timer has been reset to 2:10.",
    });
  }, []);

  const advanceRound = useCallback(() => {
    rotateParticipants();
    setSession((prev) => ({
      ...prev,
      currentRound: prev.currentRound + 1,
    }));
    setTimeRemaining(ROUND_DURATION);
    toast({
      title: "New Round Started",
      description: `Round ${session.currentRound + 1} has begun. Roles and rooms have been updated.`,
    });
  }, [session.currentRound, participants, rooms]);

  const rotateParticipants = useCallback(() => {
    setParticipants((prevParticipants) => {
      const updatedParticipants = [...prevParticipants];
  
      rooms.forEach((room, roomIndex) => {
        const roomParticipants = updatedParticipants.filter(p => p.currentRoomId === room.id);
  
        const pilot = roomParticipants.find(p => p.role === 'pilot');
        const copilot = roomParticipants.find(p => p.role === 'copilot');
  
        if (pilot && copilot) {
          const nextRoomIndex = (roomIndex + 1) % rooms.length;
          const nextRoomId = rooms[nextRoomIndex].id;
  
          // Atualizar o piloto: mover para próxima sala como observer
          const pilotIndex = updatedParticipants.findIndex(p => p.id === pilot.id);
          updatedParticipants[pilotIndex] = {
            ...updatedParticipants[pilotIndex],
            role: 'observer',
            currentRoomId: nextRoomId,
            position: Math.max(
              ...updatedParticipants
                .filter(p => p.currentRoomId === nextRoomId)
                .map(p => p.position),
              -1
            ) + 1 // posição no final da nova sala
          };
  
          Logger.logRoleChange(pilot.id, pilot.name, 'pilot', 'observer');
          Logger.logMovement(pilot.id, pilot.name, room.id, nextRoomId);
  
          // Atualizar o copilot atual para piloto
          const copilotIndex = updatedParticipants.findIndex(p => p.id === copilot.id);
          updatedParticipants[copilotIndex] = {
            ...updatedParticipants[copilotIndex],
            role: 'pilot',
            position: 0 // piloto sempre na posição 0
          };
  
          Logger.logRoleChange(copilot.id, copilot.name, 'copilot', 'pilot');
  
          // Promover o próximo observer para copilot
          const nextCopilot = roomParticipants
            .filter(p => p.role === 'observer')
            .sort((a, b) => a.position - b.position)[0];
  
          if (nextCopilot) {
            const nextCopilotIndex = updatedParticipants.findIndex(p => p.id === nextCopilot.id);
            updatedParticipants[nextCopilotIndex] = {
              ...updatedParticipants[nextCopilotIndex],
              role: 'copilot',
              position: 1 // copiloto sempre na posição 1
            };
  
            Logger.logRoleChange(nextCopilot.id, nextCopilot.name, 'observer', 'copilot');
          }
        }
      });
  
      return updatedParticipants;
    });
  }, [rooms]);
  
  return (
    <SessionContext.Provider
      value={{
        session,
        rooms,
        participants,
        leaders,
        startSession,
        pauseSession,
        resetTimer,
        advanceRound,
        isRunning: session.isRunning,
        timeRemaining
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}