import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './decorators/auth.dto';
import { verify } from 'argon2';
import { Response } from 'express';

@Injectable()
export class AuthService {

    REFRESH_TOKEN_NAME = 'refreshToken';
    EXPIRE_DAY_REFRESH_TOKEN = 1;


    constructor(
        private jwt: JwtService,
        private userService: UserService

    ) { }

    async login(dto: AuthDto) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...user } = await this.validateUser(dto);

        const tokens = this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }

    async register(dto: AuthDto) {
        const userExist = await this.userService.getByEmail(dto.email);

        if (userExist) {
            throw new UnauthorizedException('User already exists');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...user } = await this.userService.create(dto);

        const tokens = this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync<{ id: string }>(refreshToken);

        if (!result) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...user } = await this.userService.getById(result.id);

        const tokens = this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }

    private issueTokens(userId: string) {
        const data = { id: userId };

        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h',
        })

        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7h',
        })

        return { accessToken, refreshToken }
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.getByEmail(dto.email);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isValid = await verify(user.password, dto.password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid password');
        }

        return user;
    }

    addRefreshTokenToResponse(response: Response, refreshToken: string) {
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

        response.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
            httpOnly: true,
            domain: 'localhost',
            expires: expiresIn,
            // For production, set secure to true and sameSite to 'lax'
            secure: true,
            sameSite: 'none',
        });
    }

    removeRefreshTokenFromResponse(response: Response) {
        response.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: true,
            domain: 'localhost',
            expires: new Date(0),
            // For production, set secure to true and sameSite to 'lax'
            secure: true,
            sameSite: 'none',
        });
    }

}
