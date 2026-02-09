
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRuleDto {
    @ApiProperty({ example: 'late_penalty' })
    @IsString()
    @IsNotEmpty()
    ruleKey: string;

    @ApiProperty({ example: { minutes: 10, penalty: 5 } })
    @IsObject()
    @IsNotEmpty()
    ruleValue: any;
}

export class CreateRuleSetDto {
    @ApiProperty({ example: 'Standard Rules 2024' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'ALL' })
    @IsString()
    @IsNotEmpty()
    appliesTo: string;

    @ApiProperty({ example: '2024-01-01T00:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    effectiveFrom: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    effectiveTo?: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    priority: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({ type: [CreateRuleDto] })
    @IsNotEmpty()
    rules: CreateRuleDto[];
}
