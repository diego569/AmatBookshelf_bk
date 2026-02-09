
export class Person {
    constructor(
        public readonly id: string,
        public fullName: string,
        public email: string | null = null,
        public phone: string | null = null,
        public createdAt?: Date,
    ) { }
}
