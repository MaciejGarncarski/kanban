import { GetTeamsResponseDto } from 'src/teams/application/dtos/get-teams.response.dto';

export interface TeamsRepositoryInterface {
  getUserTeams(userId: string): Promise<GetTeamsResponseDto>;
}
