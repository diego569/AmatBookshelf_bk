
export enum MemberRole {
    MEMBER = 'MEMBER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'admin',
}

export enum MemberStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    LEFT = 'LEFT',
}

export class Membership {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public readonly personId: string,
        public role: MemberRole = MemberRole.MEMBER,
        public status: MemberStatus = MemberStatus.ACTIVE,
        public joinedAt: Date = new Date(),
        public leftAt?: Date | null,
        public person?: any // To hold Person details if needed
    ) { }

    isActive(): boolean {
        return this.status === MemberStatus.ACTIVE && !this.leftAt;
    }

    deactivate() {
        this.status = MemberStatus.LEFT;
        this.leftAt = new Date();
    }
}
