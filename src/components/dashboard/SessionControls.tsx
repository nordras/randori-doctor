import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimerIcon, PauseIcon, PlayIcon, RotateCwIcon, FastForwardIcon } from 'lucide-react';

export default function SessionControls() {
  const { 
    isRunning, 
    startSession, 
    pauseSession, 
    resetTimer, 
    advanceRound,
    session
  } = useSession();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Session Controls</span>
            <span className="text-xs text-muted-foreground">
              Manage the randori session timing and rounds
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!isRunning ? (
              <Button onClick={startSession} variant="default" size="sm" className="gap-1">
                <PlayIcon className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseSession} variant="outline" size="sm" className="gap-1">
                <PauseIcon className="h-4 w-4" />
                Pause
              </Button>
            )}
            
            <Button onClick={resetTimer} variant="outline" size="sm" className="gap-1">
              <TimerIcon className="h-4 w-4" />
              Reset Timer
            </Button>
            
            <Button onClick={advanceRound} variant="secondary" size="sm" className="gap-1">
              <FastForwardIcon className="h-4 w-4" />
              Next Round
            </Button>
            
            <div className="text-sm bg-muted px-3 py-1 rounded-md flex items-center gap-1">
              <RotateCwIcon className="h-4 w-4" />
              Round: {session.currentRound}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}