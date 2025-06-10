import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './decorators/auth.dto';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
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

}
