import { PrismaClient, SessionType, MemberRole, MemberStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding MVP data...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@librerodeamat.com';
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const modEmail = process.env.MOD_EMAIL || 'mod@librerodeamat.com';
    const modName = process.env.MOD_NAME || 'Moderator';

    // 1. Default Club
    const club = await prisma.club.upsert({
        where: { id: 'librero-de-amat-id' }, // We use a deterministic ID for seeding
        update: {},
        create: {
            id: 'librero-de-amat-id',
            name: 'Librero de Amat',
            mode: 'in-person',
        },
    });
    console.log(`Club seeded: ${club.name}`);

    // 2. Admin Person
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminPerson = await prisma.person.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            fullName: adminName,
            email: adminEmail,
            passwordHash: adminPassword,
        },
    });
    console.log(`Admin person seeded: ${adminPerson.fullName}`);

    // 3. Admin Membership
    const existingAdminMembership = await prisma.membership.findFirst({
        where: {
            clubId: club.id,
            personId: adminPerson.id,
            leftAt: null,
        },
    });

    if (existingAdminMembership) {
        await prisma.membership.update({
            where: { id: existingAdminMembership.id },
            data: {
                role: MemberRole.admin,
                status: MemberStatus.ACTIVE,
            },
        });
    } else {
        await prisma.membership.create({
            data: {
                clubId: club.id,
                personId: adminPerson.id,
                role: MemberRole.admin,
                status: MemberStatus.ACTIVE,
            },
        });
    }
    console.log(`Admin membership seeded`);

    // 4. Moderator (Optional)
    if (modEmail) {
        const modPassword = await bcrypt.hash('mod123', 10);
        const modPerson = await prisma.person.upsert({
            where: { email: modEmail },
            update: {},
            create: {
                fullName: modName,
                email: modEmail,
                passwordHash: modPassword,
            },
        });

        const existingModMembership = await prisma.membership.findFirst({
            where: {
                clubId: club.id,
                personId: modPerson.id,
                leftAt: null,
            },
        });

        if (existingModMembership) {
            await prisma.membership.update({
                where: { id: existingModMembership.id },
                data: {
                    role: MemberRole.MODERATOR,
                    status: MemberStatus.ACTIVE,
                },
            });
        } else {
            await prisma.membership.create({
                data: {
                    clubId: club.id,
                    personId: modPerson.id,
                    role: MemberRole.MODERATOR,
                    status: MemberStatus.ACTIVE,
                },
            });
        }
        console.log(`Moderator seeded: ${modPerson.fullName}`);
    }

    // 5. Default RuleSet
    const ruleSet = await prisma.ruleSet.upsert({
        where: { id: 'default-ruleset-id' },
        update: {
            active: true,
            priority: 1,
        },
        create: {
            id: 'default-ruleset-id',
            clubId: club.id,
            name: 'Reglas por defecto',
            appliesTo: 'ALL',
            effectiveFrom: new Date('2026-01-01T00:00:00Z'),
            priority: 1,
            active: true,
        },
    });

    const rules = [
        { ruleKey: 'late_threshold_minutes', ruleValue: { minutes: 15 } },
        { ruleKey: 'session_attendance_points', ruleValue: { points: 20 } },
        { ruleKey: 'late_points_penalty', ruleValue: { points: -10 } },
    ];

    for (const rule of rules) {
        await prisma.rule.upsert({
            where: {
                ruleSetId_ruleKey: {
                    ruleSetId: ruleSet.id,
                    ruleKey: rule.ruleKey,
                },
            },
            update: { ruleValue: rule.ruleValue },
            create: {
                ruleSetId: ruleSet.id,
                ruleKey: rule.ruleKey,
                ruleValue: rule.ruleValue,
            },
        });
    }
    console.log(`RuleSet and rules seeded`);

    // 6. Default Cycle
    const cycle = await prisma.cycle.upsert({
        where: { id: 'verano-2026-cycle-id' },
        update: {},
        create: {
            id: 'verano-2026-cycle-id',
            clubId: club.id,
            name: 'Verano de lectura 2026',
            startDate: new Date('2026-02-01T00:00:00Z'),
            endDate: new Date('2026-03-07T00:00:00Z'),
        },
    });
    console.log(`Cycle seeded: ${cycle.name}`);

    // 7. Sessions
    const sessions = [
        {
            id: 'coordinacion-session-id',
            title: 'Coordinación inicial',
            sessionType: SessionType.COORDINACION,
            startsAt: new Date('2026-02-02T00:00:00Z'), // 2026-02-01 19:00 Lima (UTC-5)
        },
        {
            id: 'san-valentin-session-id',
            title: 'Sesión de San Valentín',
            sessionType: SessionType.LECTURA,
            startsAt: new Date('2026-02-14T22:00:00Z'), // 2026-02-14 17:00 Lima (UTC-5)
        },
    ];

    for (const s of sessions) {
        await prisma.session.upsert({
            where: { id: s.id },
            update: {},
            create: {
                ...s,
                clubId: club.id,
                cycleId: cycle.id,
            },
        });
    }
    console.log(`Sessions seeded`);

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
