
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../domain/attendance-record.entity';

export class AttendanceMarkDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    membershipId: string;

    @ApiProperty({ enum: AttendanceStatus })
    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsNumber()
    minutesLate?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    checkInAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class BulkAttendanceDto {
    @ApiProperty({ type: [AttendanceMarkDto] })
    @IsNotEmpty()
    marks: AttendanceMarkDto[];
}
