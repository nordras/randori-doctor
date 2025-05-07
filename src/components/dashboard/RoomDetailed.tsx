import { useSession } from '@/context/SessionContext';
import { Leader, Room, Role, getRoleBadgeVariant } from '@/lib/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRightIcon, Code2Icon, MonitorIcon, UsersRoundIcon } from 'lucide-react';

interface RoomDetailedProps {
  room: Room;
  leader?: Leader;
  expanded?: boolean;
}

export default function RoomDetailed({ room, leader, expanded = false }: RoomDetailedProps) {
  const { participants } = useSession();
  const roomParticipants = participants.filter(p => p.currentRoomId === room.id);
  
  // Sort by role (pilot first, then copilot, then observers)
  const sortedParticipants = [...roomParticipants].sort((a, b) => {
    const roleOrder: Record<Role, number> = { pilot: 0, copilot: 1, observer: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  // Find the pilot who will rotate out next round
  const pilot = roomParticipants.find(p => p.role === 'pilot');
  
  // Find which room this pilot will go to next
  const currentRoomIndex = leader ? parseInt(room.id.split('-')[1]) - 1 : 0;
  const nextRoomIndex = (currentRoomIndex + 1) % 6;
  // const nextRoomId = `room-${nextRoomIndex + 1}`;
  
  // Find room's for pilot that will come to this room next round
  const previousRoomIndex = (currentRoomIndex - 1 + 6) % 6;
  const previousRoomId = `room-${previousRoomIndex + 1}`;
  const incomingPilot = participants.find(p => p.currentRoomId === previousRoomId && p.role === 'pilot');

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'pilot':
        return <Code2Icon className="h-4 w-4" />;
      case 'copilot':
        return <MonitorIcon className="h-4 w-4" />;
      case 'observer':
        return <UsersRoundIcon className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (!expanded) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{room.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {sortedParticipants.map(participant => (
                <Badge key={participant.id} variant={getRoleBadgeVariant(participant.role)}>
                  {getRoleIcon(participant.role)} 
                  <span className="ml-1">{participant.name}</span>
                </Badge>
              ))}
            </div>
            
            {pilot && incomingPilot && (
              <div className="flex items-center text-sm text-muted-foreground border-t pt-2 gap-2">
                <div className="flex items-center">
                  <Badge variant="outline" className="border-dashed">
                    {pilot.name}
                  </Badge>
                </div>
                <ArrowRightIcon className="h-4 w-4" />
                <Badge variant="outline" className="border-dashed">
                  Room {nextRoomIndex + 1}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Current Participants 1231</h3>
          <div className="space-y-2">
            {sortedParticipants.map(participant => (
              <div 
                key={participant.id} 
                className={`
                  flex items-center justify-between p-2 rounded-md
                  ${participant.role === 'pilot' ? 'bg-primary/10' : 
                    participant.role === 'copilot' ? 'bg-secondary/10' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">{participant.slackHandle}</div>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(participant.role)}>
                  {getRoleIcon(participant.role)} 
                  <span className="ml-1">{participant.role}</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Rotation Information</h3>
          {pilot && (
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <div className="text-sm font-medium">Outgoing Pilot</div>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(pilot.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{pilot.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ArrowRightIcon className="h-3 w-3 mr-1" />
                      <span>Room {nextRoomIndex + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {incomingPilot && (
                <div className="p-3 border rounded-md">
                  <div className="text-sm font-medium">Incoming</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(incomingPilot.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{incomingPilot.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>From Room {previousRoomIndex + 1}</span>
                        <ArrowRightIcon className="h-3 w-3 mx-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}