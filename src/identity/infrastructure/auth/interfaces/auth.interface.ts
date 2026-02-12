export interface JwtPayload {
    sub: string; // personId
    email: string;
}

export interface GoogleProfile {
    id: string;
    emails: Array<{ value: string; verified: boolean }>;
    displayName: string;
}
