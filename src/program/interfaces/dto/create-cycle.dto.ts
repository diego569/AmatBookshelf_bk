
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCycleDto {
    @ApiProperty({ example: 'Cycle 1: Dystocpia' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '2023-01-01T00:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    theme?: string;
}
