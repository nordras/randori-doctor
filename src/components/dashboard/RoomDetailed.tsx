import { useSession } from '@/context/SessionContext';
import { Leader, Room, Role, getRoleBadgeVariant, RoomStatus, Participant as ParticipantT } from '@/lib/models';
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

  const sortedParticipants = [...roomParticipants].sort((a, b) => {
    const roleOrder: Record<Role, number> = { pilot: 0, copilot: 1, observer: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  const pilot = roomParticipants.find(p => p.role === Role.Pilot);
  const currentRoomIndex = leader ? parseInt(room.id.split('-')[1]) - 1 : 0;
  const nextRoomIndex = (currentRoomIndex + 1) % 6;
  const previousRoomIndex = (currentRoomIndex - 1 + 6) % 6;
  const previousRoomId = `room-${previousRoomIndex + 1}`;
  const incomingPilot = participants.find(p => p.currentRoomId === previousRoomId && p.role === Role.Pilot);

  if (room.status === RoomStatus.Finished) {
    return <FinishedRoomCard room={room} participants={sortedParticipants} />;
  }

  if (!expanded) {
    return <CompactRoomCard room={room} participants={sortedParticipants} pilot={pilot} incomingPilot={incomingPilot} nextRoomIndex={nextRoomIndex} />;
  }

  return (
    <ExpandedRoomDetails
      participants={sortedParticipants}
      pilot={pilot}
      incomingPilot={incomingPilot}
      nextRoomIndex={nextRoomIndex}
      previousRoomIndex={previousRoomIndex}
    />
  );
}

// COMPONENT: Finished room view
function FinishedRoomCard({ room, participants }: { room: Room; participants: ParticipantT[] }) {
  return (
    <Card className="opacity-60">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{room.name} (Finished)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">This room has been closed and its participants were redistributed.</div>
        <div className="flex flex-wrap gap-2">
          {participants.map(participant => (
            <Badge key={participant.id} variant={getRoleBadgeVariant(participant.role)}>
              {getRoleIcon(participant.role)}
              <span className="ml-1">{participant.name}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// TODO Re check type
function CompactRoomCard({ room, participants, pilot, incomingPilot, nextRoomIndex }: any) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{room.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ParticipantsList participants={participants} />
          {pilot && incomingPilot && (
            <div className="flex items-center text-sm text-muted-foreground border-t pt-2 gap-2">
              <Badge variant="outline" className="border-dashed">{pilot.name}</Badge>
              <ArrowRightIcon className="h-4 w-4" />
              <Badge variant="outline" className="border-dashed">Room {nextRoomIndex + 1}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ExpandedRoomDetails({ participants, pilot, incomingPilot, nextRoomIndex, previousRoomIndex }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Current Participants</h3>
          <div className="space-y-2">
            {participants.map(participant => (
              <div
                key={participant.id}
                className={`
                  flex items-center justify-between p-2 rounded-md
                  ${participant.role === Role.Pilot ? 'bg-primary/10' :
                    participant.role === Role.Copilot ? 'bg-secondary/10' : ''}
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

        <RotationInfo pilot={pilot} incomingPilot={incomingPilot} nextRoomIndex={nextRoomIndex} previousRoomIndex={previousRoomIndex} />
      </div>
    </div>
  );
}

function ParticipantsList({ participants }: { participants: typeof ParticipantT[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {participants.map(participant => (
        <Badge key={participant.id} variant={getRoleBadgeVariant(participant.role)}>
          {getRoleIcon(participant.role)}
          <span className="ml-1">{participant.name}</span>
        </Badge>
      ))}
    </div>
  );
}

// COMPONENT: Rotation info block
function RotationInfo({ pilot, incomingPilot, nextRoomIndex, previousRoomIndex }: any) {
  if (!pilot) return null;
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Rotation Information</h3>
      <div className="space-y-4">
        <div className="p-3 border rounded-md">
          <div className="text-sm font-medium">Outgoing Pilot</div>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(pilot.name)}</AvatarFallback></Avatar>
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
              <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(incomingPilot.name)}</AvatarFallback></Avatar>
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
    </div>
  );
}

// Maybe move?
function getRoleIcon(role: Role) {
  switch (role) {
    case Role.Pilot:
      return <Code2Icon className="h-4 w-4" />;
    case Role.Copilot:
      return <MonitorIcon className="h-4 w-4" />;
    case Role.Observer:
      return <UsersRoundIcon className="h-4 w-4" />;
  }
}

// Maybe move?
function getInitials(name: string) {
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
}
