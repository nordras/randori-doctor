import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Participant,
  Leader,
  Room,
  RoomStatus,
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
  endSession: (roomId: string) => void;
  resetTimer: () => void;
  advanceRound: () => void;
  undo: () => void;
  redo: () => void;
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

  const [undoStack, setUndoStack] = useState<Array<{
    participants: Participant[];
    rooms: Room[];
    session: Session;
  }>>([]);

  const [redoStack, setRedoStack] = useState<Array<{
    participants: Participant[];
    rooms: Room[];
    session: Session;
  }>>([]);

  const pushToHistory = useCallback(() => {
    setUndoStack(prev => [
      ...prev,
      {
        participants,
        rooms,
        session
      }
    ]);
    setRedoStack([]);
  }, [participants, rooms, session]);

  const undo = useCallback(() => {
    setUndoStack(prevUndo => {
      if (prevUndo.length === 0) {
        toast({
          title: 'Nada para desfazer',
          description: 'Nenhuma ação anterior encontrada.',
        });
        return prevUndo;
      }

      const lastState = prevUndo[prevUndo.length - 1];

      setRedoStack(prevRedo => [
        ...prevRedo,
        {
          participants,
          rooms,
          session
        }
      ]);

      setParticipants(lastState.participants);
      setRooms(lastState.rooms);
      setSession(lastState.session);

      toast({
        title: 'Ação desfeita',
        description: 'O último estado foi restaurado.',
      });

      return prevUndo.slice(0, -1);
    });
  }, [participants, rooms, session, toast]);

  const redo = useCallback(() => {
    setRedoStack(prevRedo => {
      if (prevRedo.length === 0) {
        toast({
          title: 'Nada para refazer',
          description: 'Nenhuma ação para refazer encontrada.',
        });
        return prevRedo;
      }

      const nextState = prevRedo[prevRedo.length - 1];

      setUndoStack(prevUndo => [
        ...prevUndo,
        {
          participants,
          rooms,
          session
        }
      ]);

      setParticipants(nextState.participants);
      setRooms(nextState.rooms);
      setSession(nextState.session);

      toast({
        title: 'Ação refeita',
        description: 'O estado foi restaurado novamente.',
      });

      return prevRedo.slice(0, -1);
    });
  }, [participants, rooms, session, toast]);

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
    pushToHistory();
  }, []);

  const pauseSession = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: false }));
    toast({
      title: "Session Paused",
      description: "The randori session is now paused.",
    });
    pushToHistory();
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(ROUND_DURATION);
    toast({
      title: "Timer Reset",
      description: "The timer has been reset to 2:10.",
    });
    pushToHistory();
  }, []);

  const endSession = useCallback((roomId: string) => {
    setRooms(prevRooms => prevRooms.map(room =>
      room.id === roomId ? { ...room, status: RoomStatus.Finished } : room
    ));

    const activeRooms = rooms.filter(room => room.id !== roomId && room.status === RoomStatus.Active);

    if (activeRooms.length === 0) {
      toast({
        title: 'Erro',
        description: 'Não há salas ativas para redistribuir os participantes.',
      });
      return;
    }

    setParticipants(prevParticipants => {
      const closingParticipants = prevParticipants.filter(p => p.currentRoomId === roomId);
      const updatedParticipants = [...prevParticipants];

      closingParticipants.forEach((participant, index) => {
        const targetRoom = activeRooms[index % activeRooms.length];
        const nextPosition = Math.max(
          ...updatedParticipants
            .filter(p => p.currentRoomId === targetRoom.id)
            .map(p => p.position),
          -1
        ) + 1;

        const participantIndex = updatedParticipants.findIndex(p => p.id === participant.id);
        updatedParticipants[participantIndex] = {
          ...participant,
          currentRoomId: targetRoom.id,
          role: Role.Observer,
          position: nextPosition
        };

        Logger.logMovement(participant.id, participant.name, roomId, targetRoom.id);
      });

      return updatedParticipants;
    });

    toast({
      title: 'Sala finalizada',
      description: `A sala ${roomId} foi encerrada e os participantes foram redistribuídos.`,
    });
    pushToHistory();
  }, [rooms, toast]);

  const rotateParticipants = useCallback(() => {
    setParticipants((prevParticipants) => {
      const updatedParticipants = [...prevParticipants];

      const activeRooms = rooms.filter(room => room.status === RoomStatus.Active);

      activeRooms.forEach((room, roomIndex) => {
        const roomParticipants = updatedParticipants.filter(p => p.currentRoomId === room.id);

        const pilot = roomParticipants.find(p => p.role === Role.Pilot);
        const copilot = roomParticipants.find(p => p.role === Role.Copilot);

        if (pilot && copilot) {
          const nextRoomIndex = (roomIndex + 1) % activeRooms.length;
          const nextRoomId = activeRooms[nextRoomIndex].id;

          const pilotIndex = updatedParticipants.findIndex(p => p.id === pilot.id);
          updatedParticipants[pilotIndex] = {
            ...updatedParticipants[pilotIndex],
            role: Role.Observer,
            currentRoomId: nextRoomId,
            position: Math.max(
              ...updatedParticipants
                .filter(p => p.currentRoomId === nextRoomId)
                .map(p => p.position),
              -1
            ) + 1
          };

          Logger.logRoleChange(pilot.id, pilot.name, Role.Pilot, Role.Observer);
          Logger.logMovement(pilot.id, pilot.name, room.id, nextRoomId);

          // Atualizar o copilot atual para piloto
          const copilotIndex = updatedParticipants.findIndex(p => p.id === copilot.id);
          updatedParticipants[copilotIndex] = {
            ...updatedParticipants[copilotIndex],
            role: Role.Pilot,
            position: 0
          };

          Logger.logRoleChange(copilot.id, copilot.name, Role.Copilot, Role.Pilot);

          // Promover o próximo observer para copilot
          const nextCopilot = roomParticipants
            .filter(p => p.role === Role.Observer)
            .sort((a, b) => a.position - b.position)[0];

          if (nextCopilot) {
            const nextCopilotIndex = updatedParticipants.findIndex(p => p.id === nextCopilot.id);
            updatedParticipants[nextCopilotIndex] = {
              ...updatedParticipants[nextCopilotIndex],
              role: Role.Copilot,
              position: 1
            };

            Logger.logRoleChange(nextCopilot.id, nextCopilot.name, Role.Observer, Role.Copilot);
          }
        }
      });
      pushToHistory();
      return updatedParticipants;
    });

  }, [rooms]);

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
    pushToHistory();
  }, [rotateParticipants, toast, session.currentRound]);

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
        endSession,
        undo,
        redo,
        isRunning: session.isRunning,
        timeRemaining
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}