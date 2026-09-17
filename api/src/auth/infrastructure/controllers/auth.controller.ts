import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request, type Response } from 'express';
import { RefreshAccessTokenReturn } from '../../application/commands/handlers/refresh-access-token.handler.js';
import { RegisterHandlerReturn } from '../../application/commands/handlers/register.handler.js';
import { SignInUserCommandReturn } from '../../application/commands/handlers/sign-in-user.handler.js';
import { LogoutCommand } from '../../application/commands/logout.command.js';
import { RefreshAccessTokenCommand } from '../../application/commands/refresh-access-token.command.js';
import { RegisterCommand } from '../../application/commands/register.command.js';
import { SignInUserCommand } from '../../application/commands/sign-in-user.command.js';
import { LogoutResponseDto } from '../../application/dtos/logout.response.dto.js';
import { RefreshTokenResponseDto } from '../../application/dtos/refresh-token-response.dto.js';
import {
  RegisterBodyDto,
  registerBodySchema,
  type RegisterBody,
} from '../../application/dtos/register-body.dto.js';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto.js';
import {
  SignInBodyDto,
  signInBodySchema,
  type SignInBody,
} from '../../application/dtos/sign-in-body.dto.js';
import { SignInResponseDto } from '../../application/dtos/sign-in-response.dto.js';
import { GetMeQuery } from '../../application/queries/get-me.query.js';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { JWTPayload } from '../../domain/token.types.js';
import { clearTokenCookie, setTokenCookie } from '../utils/set-token-cookie.js';
import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import accessTokenCookieConfig from '../../../infrastructure/configs/access-token-cookie.config.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';
import refreshTokenCookieConfig from '../../../infrastructure/configs/refresh-token-cookie.config.js';
import { UserResponseDto } from '../../../user/application/dtos/user.response.dto.js';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(refreshTokenCookieConfig.KEY)
    private readonly refreshTokenConf: ConfigType<
      typeof refreshTokenCookieConfig
    >,
    @Inject(accessTokenCookieConfig.KEY)
    private readonly accessTokenConf: ConfigType<
      typeof accessTokenCookieConfig
    >,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post(routesV1.auth.signIn)
  @ApiOperation({
    summary: 'Login a user and get access and refresh tokens',
  })
  @ApiBody({ type: SignInBodyDto })
  @ApiOkResponse({
    type: SignInResponseDto,
    description: 'Access token and refresh token set in HttpOnly cookie',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async signInUser(
    @Body({ schema: signInBodySchema }) body: SignInBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SignInResponseDto> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      SignInUserCommand,
      SignInUserCommandReturn
    >(new SignInUserCommand(body.email, body.password));

    setTokenCookie(response, this.refreshTokenConf, refreshToken);
    setTokenCookie(response, this.accessTokenConf, accessToken);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post(routesV1.auth.register)
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 200,
    type: RegisterResponseDto,
    description: 'Registered user',
  })
  @ApiBody({ type: RegisterBodyDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async registerUser(
    @Body({ schema: registerBodySchema }) body: RegisterBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.commandBus.execute<
      RegisterCommand,
      RegisterHandlerReturn
    >(
      new RegisterCommand(
        body.email,
        body.name,
        body.password,
        body.confirmPassword,
      ),
    );

    if (!refreshToken || !accessToken) {
      throw new UnauthorizedException('Registration failed');
    }

    setTokenCookie(response, this.refreshTokenConf, refreshToken);
    setTokenCookie(response, this.accessTokenConf, accessToken);

    return { accessToken, user };
  }

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Get(routesV1.auth.me)
  @ApiOperation({
    summary: 'Gets the current logged-in user',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Signed in user',
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorResponse,
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async checkCurrentSession(@Req() req: Request) {
    const data = await this.queryBus.execute<GetMeQuery, JWTPayload>(
      new GetMeQuery(req.userId),
    );

    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post(routesV1.auth.refresh)
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiResponse({
    status: 200,
    type: RefreshTokenResponseDto,
    description: 'Refresh access token',
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorResponse,
  })
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.signedCookies[
      this.refreshTokenConf.name
    ] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, newRefreshToken } = await this.commandBus.execute<
      RefreshAccessTokenCommand,
      RefreshAccessTokenReturn
    >(new RefreshAccessTokenCommand(refreshToken));

    setTokenCookie(res, this.refreshTokenConf, newRefreshToken);
    setTokenCookie(res, this.accessTokenConf, accessToken);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Delete(routesV1.auth.logout)
  @ApiOperation({
    summary: 'Logout user',
  })
  @ApiResponse({
    status: 200,
    type: LogoutResponseDto,
    description: 'Logged out',
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.signedCookies[
      this.refreshTokenConf.name
    ] as string;

    clearTokenCookie(res, this.refreshTokenConf);
    clearTokenCookie(res, this.accessTokenConf);

    if (!refreshToken) {
      return { message: 'Logged out' };
    }

    await this.commandBus.execute<LogoutCommand>(
      new LogoutCommand(refreshToken),
    );

    return { message: 'Logged out' };
  }
}
