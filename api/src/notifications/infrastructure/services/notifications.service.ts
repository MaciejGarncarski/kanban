import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly teamRepository: TeamRepository) {}

  private clients = new Map<string, Subject<any>>();

  addClient(userId: string, subject: Subject<any>) {
    this.clients.set(userId, subject);
  }

  removeClient(userId: string) {
    this.clients.delete(userId);
  }

  async sendToTeamMembers(teamId: string) {
    const teamMembers =
      await this.teamRepository.getTeamMemberIdsByReadableId(teamId);

    for (const memberId of teamMembers) {
      const client = this.clients.get(memberId);

      if (client) {
        client.next({
          data: { readableTeamId: teamId },
        });
      }
    }
  }
}
