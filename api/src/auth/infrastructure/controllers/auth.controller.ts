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
import { RefreshAccessTokenReturn } from 'src/auth/application/commands/handlers/refresh-access-token.handler';
import { RegisterHandlerReturn } from 'src/auth/application/commands/handlers/register.handler';
import { SignInUserCommandReturn } from 'src/auth/application/commands/handlers/sign-in-user.handler';
import { LogoutCommand } from 'src/auth/application/commands/logout.command';
import { RefreshAccessTokenCommand } from 'src/auth/application/commands/refresh-access-token.command';
import { RegisterCommand } from 'src/auth/application/commands/register.command';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { LogoutResponseDto } from 'src/auth/application/dtos/logout.response.dto';
import { RefreshTokenResponseDto } from 'src/auth/application/dtos/refresh-token-response.dto';
import { RegisterBodyDto } from 'src/auth/application/dtos/register-body.dto';
import { RegisterResponseDto } from 'src/auth/application/dtos/register-response.dto';
import { SignInBodyDto } from 'src/auth/application/dtos/sign-in-body.dto';
import { SignInResponseDto } from 'src/auth/application/dtos/sign-in-response.dto';
import { GetMeQuery } from 'src/auth/application/queries/get-me.query';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { JWTPayload } from 'src/auth/domain/token.types';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import accessTokenCookieConfig from 'src/infrastructure/configs/access-token-cookie.config';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import refreshTokenCookieConfig from 'src/infrastructure/configs/refresh-token-cookie.config';
import { UserResponseDto } from 'src/user/application/dtos/user.response.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(refreshTokenCookieConfig.KEY)
    private readonly cookieConf: ConfigType<typeof refreshTokenCookieConfig>,
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
    @Body() body: SignInBodyDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SignInResponseDto> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      SignInUserCommand,
      SignInUserCommandReturn
    >(new SignInUserCommand(body.email, body.password));

    response.cookie(this.cookieConf.name, refreshToken, {
      sameSite: this.cookieConf.sameSite,
      domain: this.cookieConf.domain,
      signed: this.cookieConf.signed,
      httpOnly: this.cookieConf.httpOnly,
      secure: this.cookieConf.secure,
      maxAge: this.cookieConf.maxAge,
    });

    response.cookie('accessToken', accessToken, {
      sameSite: this.accessTokenConf.sameSite,
      domain: this.accessTokenConf.domain,
      signed: this.accessTokenConf.signed,
      httpOnly: this.accessTokenConf.httpOnly,
      secure: this.accessTokenConf.secure,
      maxAge: this.accessTokenConf.maxAge,
    });

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
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async registerUser(
    @Body() body: RegisterBodyDto,
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

    response.cookie(this.cookieConf.name, refreshToken, {
      sameSite: this.cookieConf.sameSite,
      domain: this.cookieConf.domain,
      signed: this.cookieConf.signed,
      httpOnly: this.cookieConf.httpOnly,
      secure: this.cookieConf.secure,
      maxAge: this.cookieConf.maxAge,
    });

    response.cookie('accessToken', accessToken, {
      sameSite: this.accessTokenConf.sameSite,
      domain: this.accessTokenConf.domain,
      signed: this.accessTokenConf.signed,
      httpOnly: this.accessTokenConf.httpOnly,
      secure: this.accessTokenConf.secure,
      maxAge: this.accessTokenConf.maxAge,
    });

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
    const refreshToken = req.signedCookies[this.cookieConf.name] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, newRefreshToken } = await this.commandBus.execute<
      RefreshAccessTokenCommand,
      RefreshAccessTokenReturn
    >(new RefreshAccessTokenCommand(refreshToken));

    res.cookie(this.cookieConf.name, newRefreshToken, {
      secure: this.cookieConf.secure,
      httpOnly: this.cookieConf.httpOnly,
      maxAge: this.cookieConf.maxAge,
      signed: this.cookieConf.signed,
    });

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
    const refreshToken = req.signedCookies[this.cookieConf.name] as string;

    res.clearCookie(this.cookieConf.name, {
      secure: this.cookieConf.secure,
      httpOnly: this.cookieConf.httpOnly,
      maxAge: this.cookieConf.maxAge,
      signed: this.cookieConf.signed,
      domain: this.cookieConf.domain,
      sameSite: this.cookieConf.sameSite,
    });
    res.clearCookie(this.accessTokenConf.name, {
      secure: this.accessTokenConf.secure,
      httpOnly: this.accessTokenConf.httpOnly,
      maxAge: this.accessTokenConf.maxAge,
      signed: this.accessTokenConf.signed,
      domain: this.accessTokenConf.domain,
      sameSite: this.accessTokenConf.sameSite,
    });

    if (!refreshToken) {
      return { message: 'Logged out' };
    }

    await this.commandBus.execute<LogoutCommand>(
      new LogoutCommand(refreshToken),
    );

    return { message: 'Logged out' };
  }
}
