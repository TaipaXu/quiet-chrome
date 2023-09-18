import MFavorite from './favorite';

interface Params {
    name: string;
    children?: MFavorite[];
};

export default class Group {
    public name: string;
    public children?: MFavorite[];
    // public get children(): MFavorite[] | undefined {
    //     return this._children;
    // };


    constructor({ name, children }: Params) {
        this.name = name;
        this.children = children;
    }

    public rename(newName: string) {
        this.name = newName;
    }

    public addFavorite(favorite: MFavorite) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(favorite);
    }

    public removeFavorite(favorite: MFavorite) {
        if (this.children) {
            this.children = this.children.filter(item => item.url !== favorite.url);
        }
    }

    public toJSON(): Params {
        return {
            name: this.name,
            children: this.children,
        };
    }

    public static fromJSON(json: Params): Group {
        return new Group(json);
    }

};

// export default interface Group {
//     name: string;
//     children?: MFavorite;
// };
