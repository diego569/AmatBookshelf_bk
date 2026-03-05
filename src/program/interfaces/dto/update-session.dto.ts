import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SessionType } from '../../domain/session.entity';

export class UpdateSessionDto {
    @ApiProperty({ enum: SessionType, required: false })
    @IsOptional()
    @IsEnum(SessionType)
    sessionType?: SessionType;

    @ApiProperty({ example: '2023-01-01T20:00:00Z', required: false })
    @IsOptional()
    @IsDateString()
    startsAt?: string;

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

