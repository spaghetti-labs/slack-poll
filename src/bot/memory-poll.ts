import { v4 } from "uuid";

export class Option {
    readonly id = v4()
    constructor(
        public text: string,
    ) {
    }
}

export class Poll {
    readonly id = v4()
    readonly options: Option[] = []

    addOption(text: string): Option {
        const option = new Option(text)
        this.options.push(option)
        return option
    }
    
    private static polls: {[id: string]: Poll} = {}
    public static createPoll() {
        const poll = new Poll()
        this.polls[poll.id] = poll
        return poll
    }
    public static getPoll(id: string): Poll | null {
        return this.polls[id] ?? null
    }
}
