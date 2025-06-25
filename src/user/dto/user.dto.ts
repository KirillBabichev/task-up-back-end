import { IsEmail, IsNumber, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class TimerSettingDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    workInterval?: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    breakInterval?: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    intervalsCount?: number
}

export class UserDto extends TimerSettingDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsOptional()
    @MinLength(6, {
        message: 'Password must be at least 6 characters long',
    })

    @IsOptional()
    @IsString()
    password: string;
}
