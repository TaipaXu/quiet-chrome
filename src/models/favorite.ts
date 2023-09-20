interface Params {
    name: string;
    url: string;
};

export default class Favorite {
    public name;
    public readonly url;

    constructor(params: Params) {
        this.name = params.name;
        this.url = params.url;
    }
};
