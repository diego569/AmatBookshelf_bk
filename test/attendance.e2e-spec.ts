
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AttendanceStatus } from '../src/governance/domain/attendance-record.entity';
import { SessionType } from '../src/program/domain/session.entity';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('Attendance Flow (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        // Clean up data
        await prisma.pointsTransaction.deleteMany();
        await prisma.pointsAccount.deleteMany();
        await prisma.incident.deleteMany();
        await prisma.attendanceRecord.deleteMany();
        await prisma.rule.deleteMany();
        await prisma.ruleSet.deleteMany();
        await prisma.session.deleteMany();
        await prisma.cycle.deleteMany();
        await prisma.membership.deleteMany();
        await prisma.person.deleteMany();
        await prisma.club.deleteMany();
        await app.close();
    });

    it('should mark attendance and apply governance rules', async () => {
        // 1. Create Club
        const clubRes = await request(app.getHttpServer())
            .post('/clubs')
            .send({ name: 'E2E Test Club', mode: 'virtual' })
            .expect(201);
        const clubId = clubRes.body.id;

        // 2. Create Person
        const personRes = await request(app.getHttpServer())
            .post('/people')
            .send({ fullName: 'John Doe', email: 'john@example.com' })
            .expect(201);
        const personId = personRes.body.id;

        // 3. Create Membership
        const membershipRes = await request(app.getHttpServer())
            .post('/memberships')
            .send({ clubId, personId, role: 'MEMBER' })
            .expect(201);
        const membershipId = membershipRes.body.id;

        // 4. Create RuleSet
        await request(app.getHttpServer())
            .post(`/clubs/${clubId}/rule-sets`)
            .send({
                name: 'E2E Rules',
                appliesTo: `SESSION:${SessionType.LECTURA}`,
                effectiveFrom: new Date().toISOString(),
                priority: 1,
                rules: [
                    { ruleKey: 'session_attendance_points', ruleValue: { points: 10 } },
                    { ruleKey: 'late_threshold_minutes', ruleValue: { minutes: 5 } },
                    { ruleKey: 'late_points_penalty', ruleValue: { points: -3 } }
                ]
            })
            .expect(201);

        // 5. Create Session
        const sessionRes = await request(app.getHttpServer())
            .post(`/clubs/${clubId}/sessions`)
            .send({
                title: 'E2E Reading Session',
                sessionType: SessionType.LECTURA,
                startsAt: new Date().toISOString(),
            })
            .expect(201);
        const sessionId = sessionRes.body.id;

        // 6. Mark Attendance (Late)
        await request(app.getHttpServer())
            .post(`/sessions/${sessionId}/attendance`)
            .send({
                marks: [
                    {
                        membershipId,
                        status: AttendanceStatus.PRESENT,
                        minutesLate: 10,
                        notes: 'Late arrival'
                    }
                ]
            })
            .expect(201);

        // 7. Wait for async processing (since EventEmitter2 async: true)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 8. Verify Points
        const pointsRes = await request(app.getHttpServer())
            .get(`/memberships/${membershipId}/points?clubId=${clubId}`)
            .expect(200);

        // Expected points: 10 (base) - 3 (penalty) = 7
        expect(pointsRes.body.points).toBe(7);

        // 9. Verify Incidents
        const incidentsRes = await request(app.getHttpServer())
            .get(`/clubs/${clubId}/incidents?membershipId=${membershipId}`)
            .expect(200);

        expect(incidentsRes.body).toHaveLength(1);
        expect(incidentsRes.body[0].type).toBe('LATE');
    });
});
