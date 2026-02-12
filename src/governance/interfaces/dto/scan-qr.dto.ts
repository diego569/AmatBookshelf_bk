import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanQrDto {
    @ApiProperty({ description: 'Signed QR token from the manager' })
    @IsNotEmpty()
    @IsString()
    qrToken: string;

    @ApiProperty({ required: false, description: 'Latitude for geolocation' })
    @IsOptional()
    @IsNumber()
    lat?: number;

    @ApiProperty({ required: false, description: 'Longitude for geolocation' })
    @IsOptional()
    @IsNumber()
    long?: number;
}
