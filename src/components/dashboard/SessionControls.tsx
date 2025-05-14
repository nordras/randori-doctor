import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function SessionControls() {
  const {
    isRunning,
    startSession,
    pauseSession,
    endSession,
    resetTimer,
    advanceRound,
    session,
    rooms,
    timeRemaining
  } = useSession();

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {!isRunning ? (
              <Button onClick={startSession} variant="default" size="sm" className="gap-1">
                Start
              </Button>
            ) : (
              <Button onClick={pauseSession} variant="outline" size="sm" className="gap-1">
                Pause
              </Button>
            )}

            <Button onClick={resetTimer} variant="outline" size="sm" className="gap-1">
              Reset Timer
            </Button>

            <Button onClick={advanceRound} variant="secondary" size="sm" className="gap-1">
              Next Round
            </Button>

            <div className="text-sm bg-muted px-3 py-1 rounded-md flex items-center gap-1">
              Round: {session.currentRound + 1}
            </div>

            <div className="text-sm bg-muted px-3 py-1 rounded-md flex items-center gap-1">
              Time: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Room to Finish" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => endSession(selectedRoomId)}
                variant="destructive"
                size="sm"
                disabled={!selectedRoomId}
              >
                Finish Room
              </Button>
            </div>
          </div>


        </div>
      </CardContent>
    </Card>
  );
}
