import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/infrastructure/controllers/auth.controller';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from 'src/auth/common/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [CqrsModule],
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockResolvedValue({ userId: 1 }),
          },
        },
        {
          provide: 'CONFIGURATION(refresh-token-cookie)',
          useValue: { name: 'refresh-token', maxAge: 3600 },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', async () => {
    const mockPayload = {
      id: 'user-123',
    };

    (queryBus.execute as jest.Mock).mockResolvedValue(mockPayload);
    const req = { userId: 'user-123' } as unknown as Request;
    const result = await controller.checkCurrentSession(req);
    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toEqual(mockPayload);
  });
});
