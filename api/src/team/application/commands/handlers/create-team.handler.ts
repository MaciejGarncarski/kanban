import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { generateReadableId } from '../../../../infrastructure/persistence/generate-readable-id.js';
import { ProfanityCheckService } from '../../../../infrastructure/services/profanity-check.service.js';
import { CreateTeamCommand } from '../create-team.command.js';
import { TeamDto, teamSchema } from '../../dtos/team.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';
import { TeamRepository } from '../../../infrastructure/persistence/team.repository.js';

@CommandHandler(CreateTeamCommand)
export class CreateTeamHandler implements ICommandHandler<CreateTeamCommand> {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(command: CreateTeamCommand): Promise<TeamDto> {
    const { name, description, members, userId } = command;

    const isNameProfane = await this.profanityCheckService.isProfane(name);
    if (isNameProfane) {
      throw new BadRequestException('Team name contains profane content');
    }

    const isDescriptionProfane =
      await this.profanityCheckService.isProfane(description);

    if (isDescriptionProfane) {
      throw new BadRequestException(
        'Team description contains profane content',
      );
    }

    const team = await this.teamRepository.createTeam(
      userId,
      {
        name,
        readable_id: generateReadableId(),
        description,
      },
      members,
    );

    return parseResponse<TeamDto>(teamSchema, team);
  }
}
