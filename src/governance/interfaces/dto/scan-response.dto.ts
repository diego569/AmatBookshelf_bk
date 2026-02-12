import { ApiProperty } from '@nestjs/swagger';

export class ScanResponseDto {
    @ApiProperty({ description: 'Whether the operation was successful' })
    ok: boolean;

    @ApiProperty({ description: 'Attendance status', enum: ['ON_TIME', 'LATE'] })
    status: 'ON_TIME' | 'LATE';

    @ApiProperty({ description: 'Minutes late' })
    minutesLate: number;

    @ApiProperty({ description: 'Points awarded or deducted for this scan' })
    pointsDelta: number;

    @ApiProperty({ description: 'Total points for the current cycle/club' })
    totalPoints: number;

    @ApiProperty({ description: 'Membership ID of the person scanning' })
    membershipId: string;

    @ApiProperty({ description: 'Session ID' })
    sessionId: string;

    @ApiProperty({ description: 'User-friendly message' })
    message: string;

    @ApiProperty({ description: 'Timestamp of the check-in' })
    checkInTime: Date;
}
