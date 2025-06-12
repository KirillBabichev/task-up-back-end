import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Priority } from "generated/prisma";

export class TaskDto {
    @IsString()
    @IsOptional()
    name: string

    @IsString()
    @IsOptional()
    isCompleted: boolean

    @IsString()
    @IsOptional()
    createdAt?: string

    @IsEnum(Priority)
    @IsOptional()
    @Transform(({ value }) => ('' + value).toLowerCase())
    priority?: Priority;
}
