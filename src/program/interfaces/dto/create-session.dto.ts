
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SessionType } from '../../domain/session.entity';

export class CreateSessionDto {
    @ApiProperty({ enum: SessionType })
    @IsEnum(SessionType)
    @IsNotEmpty()
    sessionType: SessionType;

    @ApiProperty({ example: '2023-01-01T20:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    startsAt: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    endsAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    cycleId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;
}
