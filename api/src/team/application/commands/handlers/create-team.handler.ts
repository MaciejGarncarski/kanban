import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { CreateTeamCommand } from 'src/team/application/commands/create-team.command';
import { TeamDto } from 'src/team/application/dtos/team.dto';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

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

    return plainToInstance(TeamDto, instanceToPlain(team), {
      excludeExtraneousValues: true,
    });
  }
}
