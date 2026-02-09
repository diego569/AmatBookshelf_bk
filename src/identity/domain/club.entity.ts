
export class Club {
    constructor(
        public readonly id: string,
        public name: string,
        public mode?: string | null,
        public createdAt?: Date,
    ) { }

    public updateName(newName: string) {
        this.name = newName;
    }
}
