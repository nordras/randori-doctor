import { Role } from './models';

interface LogEntry {
  timestamp: string;
  type: 'movement' | 'role_change';
  participantId: string;
  participantName: string;
  fromRoom?: string;
  toRoom?: string;
  fromRole?: Role;
  toRole?: Role;
}

class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  private static writeLog(entry: LogEntry): void {
    const logLine = `[${entry.timestamp}] ${entry.type.toUpperCase()} - ${entry.participantName} (${entry.participantId}): ` +
      (entry.type === 'movement' 
        ? `Moved from Room ${entry.fromRoom} to Room ${entry.toRoom}`
        : `Role changed from ${entry.fromRole} to ${entry.toRole}`);
    // TODO write a file or connect it on a small api, maybe I should put it on nexstjs
    console.log(logLine);
  }

  static logMovement(
    participantId: string,
    participantName: string,
    fromRoom: string,
    toRoom: string
  ): void {
    this.writeLog({
      timestamp: this.formatTimestamp(),
      type: 'movement',
      participantId,
      participantName,
      fromRoom,
      toRoom
    });
  }

  static logRoleChange(
    participantId: string,
    participantName: string,
    fromRole: Role,
    toRole: Role
  ): void {
    this.writeLog({
      timestamp: this.formatTimestamp(),
      type: 'role_change',
      participantId,
      participantName,
      fromRole,
      toRole
    });
  }
}

export default Logger