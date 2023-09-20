import MFavorite from './favorite';

interface Params {
    name: string;
    children?: MFavorite[];
};

export default class Group {
    public name: string;
    private _children?: MFavorite[];

    constructor({ name, children }: Params) {
        this.name = name;
        this._children = children;
    }

    public get children() {
        return this._children;
    }

    public rename(newName: string) {
        this.name = newName;
    }

    public addFavorite(favorite: MFavorite) {
        if (!this._children) {
            this._children = [];
        }
        this._children.push(favorite);
    }

    public removeFavorite(favorite: MFavorite) {
        if (this._children) {
            this._children = this._children.filter(item => item.url !== favorite.url);
        }
    }

    public toJSON(): Params {
        return {
            name: this.name,
            children: this._children
        };
    }

    public static fromJSON(json: Params): Group {
        return new Group(json);
    }

};
