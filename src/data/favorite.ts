import * as storage from '@/storage';
import MGroup from '@/models/group';
import MFavorite from '@/models/favorite';

export const getRecords = async (): Promise<MGroup[]> => {
    const data = await storage.sync.get('favorites', {});
    const records: MGroup[] = [];
    if (data.items === undefined) {
        records.push(new MGroup({
            name: 'Default',
            children: [],
        }));
    } else {
        for (const item of data.items) {
            const group: MGroup = new MGroup({
                name: item.name,
                children: [],
            });

            if (item.children !== undefined && item.children.length > 0) {
                for (const groupItem of item.children) {
                    group.addFavorite(new MFavorite({
                        name: groupItem.name,
                        url: groupItem.url,
                    }));
                }

            }
            records.push(group);
        }
    }

    return records;
};

export const setRecords = async (records: MGroup[]) => {
    const items = [];
    for (const record of records) {
        const item = {
            name: record.name,
            children: <any>[],
        };
        for (const favorite of record.children || []) {
            item.children.push({
                name: favorite.name,
                url: favorite.url,
            });
        }
        items.push(item);
    }

    await storage.sync.set({
        favorites: {
            version: '0.1.0',
            items,
        },
    });
};

export const addFavorite = async (favorite: MFavorite, groupName: string) => {
    const records: MGroup[] = await getRecords();
    for (const item of records) {
        if (item.name === groupName) {
            item.addFavorite(favorite);
            break;
        }
    }
    setRecords(records);
};

export const renameFavorite = async (url: string, name: string) => {
    const records: MGroup[] = await getRecords();
    for (const group of records) {
        for (const favorite of group.children || []) {
            if (favorite.url === url) {
                favorite.name = name;
                setRecords(records);
                return;
            }
        }
    }
};

export const removeFavorite = async (url: string) => {
    const records: MGroup[] = await getRecords();
    for (const group of records) {
        for (const favorite of group.children || []) {
            if (favorite.url === url) {
                group.removeFavorite(favorite);
                setRecords(records);
                return;
            }
        }
    }
};

export const getAllGroups = async (): Promise<MGroup[]> => {
    const data = await storage.sync.get('favorites', {});
    const groups: MGroup[] = [];
    if (data.items === undefined) {
        groups.push(new MGroup({
            name: 'Default',
            children: [],
        }));
    } else {
        for (const item of data.items) {
            const group: MGroup = new MGroup({
                name: item.name,
                children: [],
            });
            if (item.children !== undefined && item.children.length > 0) {
                group.addFavorite(new MFavorite({
                    name: item.name,
                    url: item.url,
                }));
            }
            groups.push(group);
        }
    }

    return groups;
};

export const isFavorite = async (url: string): Promise<boolean> => {
    const records: MGroup[] = await getRecords();
    for (const group of records) {
        for (const favorite of group.children || []) {
            if (favorite.url === url) {
                return true;
            }
        }
    }

    return false;
}

export const addGroup = async (name: string) => {
    const records: MGroup[] = await getRecords();
    records.push(new MGroup({
        name,
        children: [],
    }));
    setRecords(records);
};

export const removeGroup = async (name: string) => {
    const records: MGroup[] = await getRecords();
    for (const group of records) {
        if (group.name === name) {
            records.splice(records.indexOf(group), 1);
            break;
        }
    }
    setRecords(records);
};

export const renameGroup = async (oldName: string, newName: string) => {
    const records: MGroup[] = await getRecords();
    for (const group of records) {
        if (group.name === oldName) {
            group.name = newName;
            break;
        }
    }
    setRecords(records);
};
