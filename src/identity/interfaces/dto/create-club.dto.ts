
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClubDto {
    @ApiProperty({ example: 'AmatBookshelf Lima', description: 'Name of the book club' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'in-person', description: 'Mode of the club', required: false })
    @IsOptional()
    @IsString()
    mode?: string;
}
