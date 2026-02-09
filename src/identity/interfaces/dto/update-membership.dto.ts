
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole, MemberStatus } from '../../domain/membership.entity';

export class UpdateMembershipDto {
    @ApiProperty({ enum: MemberRole, required: false })
    @IsOptional()
    @IsEnum(MemberRole)
    role?: MemberRole;

    @ApiProperty({ enum: MemberStatus, required: false })
    @IsOptional()
    @IsEnum(MemberStatus)
    status?: MemberStatus;
}
