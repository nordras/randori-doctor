import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import RoomDetailed from './RoomDetailed';
import SessionControls from './SessionControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/lib/models';

export default function LeaderDashboard() {
  const { rooms, leaders, session, timeRemaining } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  
  const formattedTime = formatTime(timeRemaining);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leader Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your randori session with participants and rooms
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-2xl font-mono bg-secondary/30 px-3 py-1 rounded-md">
            {formattedTime}
          </div>
          <div className="text-sm text-muted-foreground">
            Round {session.currentRound || 0}
          </div>
        </div>
      </div>

      <SessionControls />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Room Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => {
              const leader = leaders.find(l => l.roomId === room.id);
              return (
                <RoomDetailed
                  key={room.id}
                  room={room}
                  leader={leader}
                />
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          {rooms.map(room => {
            const leader = leaders.find(l => l.roomId === room.id);
            return (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>{room.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Leader: {leader?.name}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Zoom: <a href={leader?.zoomLink} target="_blank" rel="noreferrer" className="underline">Join Meeting</a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RoomDetailed
                    key={room.id}
                    room={room}
                    leader={leader}
                    expanded
                  />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}