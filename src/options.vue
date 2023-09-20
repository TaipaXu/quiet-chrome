<template>
    <v-layout>
        <v-navigation-drawer>
            <v-toolbar :elevation="8" title="Favorites">
                <v-spacer></v-spacer>
                <v-btn icon @click="addFolder">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-toolbar>

            <v-list :lines="false" density="compact" nav>
                <v-list-item
                v-for="(item, i) in groups"
                :key="i"
                :value="item"
                color="primary"
                :active="selectedGroup === item"
                @click="handleGroupClicked(item)"
                @contextmenu="handleGroupContextMenu($event, item)">
                    <template #prepend>
                        <v-icon icon="mdi-folder"></v-icon>
                    </template>
                    <v-list-item-title>
                        {{ item.name }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>

            <v-menu
            v-model="showGroupMenu"
            :content-props="{
                style: `left: ${x}px; top: ${y}px;`
            }">
                <v-list density="compact">
                    <v-list-item
                    v-for="(item, index) in menuOptions"
                    :key="index"
                    @click="handleGroupMenuSelect(item.key)">
                        <v-list-item-title>
                            {{ item.label }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-navigation-drawer>

        <v-main>
            <v-toolbar :elevation="8" :title="selectedGroup?.name">
                <v-spacer></v-spacer>
                <v-btn icon @click="addFavorite">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-toolbar>

            <v-list :lines="false" density="compact" nav>
                <v-list-item
                v-for="(item, i) in currentFavorites"
                :key="i"
                :value="item"
                color="primary"
                @click="openPage(item.url)"
                @contextmenu="handleFavoriteContextMenu($event, item)">
                    <template #prepend>
                        <v-icon icon="mdi-web"></v-icon>
                    </template>
                    <v-list-item-title>
                        {{ item.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                        {{ item.url }}
                    </v-list-item-subtitle>

                    <template #append>
                        <v-icon icon="mdi-close" @click.stop="removeFavorite(item)"></v-icon>
                    </template>
                </v-list-item>
            </v-list>

            <v-menu
            v-model="showFavoriteMenu"
            :content-props="{
                style: `left: ${x}px; top: ${y}px;`
            }">
                <v-list density="compact">
                    <v-list-item
                    v-for="(item, index) in menuOptions"
                    :key="index"
                    @click="handleFavoriteMenuSelect(item.key)">
                        <v-list-item-title>
                            {{ item.label }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-main>
    </v-layout>
</template>

<script setup lang="ts">
import { Ref } from 'vue';
import MGroup from '@/models/group';
import MFavorite from '@/models/favorite';
import {
    getRecords as DGetRecords,
    addFavorite as DAddFavorite,
    renameFavorite as DRenameFavorite,
    removeFavorite as DRemoveFavorite,
    addGroup as DAddGroup,
    renameGroup as DRenameGroup,
    removeGroup as DRemoveGroup
} from '@/data/favorite';

const groups: Ref<MGroup[]> = ref([]);
const getGroups = async () => {
    const dataGroups: MGroup[] = await DGetRecords();
    groups.value = dataGroups;

    if (groups.value.length > 0 && selectedGroup.value === undefined) {
        handleGroupClicked(groups.value[0]);
    }
};
getGroups();

const currentFavorites: Ref<MFavorite[]> = ref([]);
const selectedGroup: Ref<MGroup | undefined> = ref(undefined);
const handleGroupClicked = (group: MGroup) => {
    selectedGroup.value = group;
    currentFavorites.value = group.children || [];
};

const removeFavorite = async (favorite: MFavorite) => {
    await DRemoveFavorite(favorite.url);
    selectedGroup.value!.removeFavorite(favorite);
};

const addFolder = async () => {
    const name = prompt('Enter folder name');
    if (name) {
        await DAddGroup(name);
        await getGroups();
    }
};

const groupForMenu: Ref<MGroup | undefined> = ref(undefined);
const favoriteForMenu: Ref<MFavorite | undefined> = ref(undefined);
let x = 0;
let y = 0;
const menuOptions = [
    {
        label: 'Rename',
        key: 'rename'
    },
    {
        label: 'Delete',
        key: 'delete'
    }
];
const showGroupMenu = ref(false);
const showFavoriteMenu = ref(false);

const handleGroupMenuSelect = async (value: string) => {
    switch (value) {
        case 'rename':
        {
            const group: MGroup = groupForMenu.value!;
            const name = prompt('Enter new name', group.name);
            if (name) {
                await DRenameGroup(group.name, name);
                await getGroups();
            }
            getGroups();
            break;
        }
        case 'delete':
        {
            const group: MGroup = groupForMenu.value!;
            await DRemoveGroup(group.name);
            getGroups();
            break;
        }
    }
    groupForMenu.value = undefined;
};

const handleFavoriteMenuSelect = async (value: string) => {
    switch (value) {
        case 'rename':
        {
            const favorite: MFavorite = favoriteForMenu.value!;
            const name = prompt('Enter new name', favorite.name);
            if (name) {
                await DRenameFavorite(favorite.url, name);
                favorite.name = name;
            }
            break;
        }
        case 'delete':
        {
            const favorite: MFavorite = favoriteForMenu.value!;
            await DRemoveFavorite(favorite.url);
            currentFavorites.value = currentFavorites.value.filter(item => (item !== favorite));
            break;
        }
    }
    favoriteForMenu.value = undefined;
};
const handleGroupContextMenu = (e: MouseEvent, group: MGroup) => {
    e.preventDefault();
    showGroupMenu.value = false;
    x = e.clientX;
    y = e.clientY;

    nextTick(() => {
        showGroupMenu.value = true;
    });
    groupForMenu.value = group;
};

const handleFavoriteContextMenu = (e: MouseEvent, favorite: MFavorite) => {
    e.preventDefault();
    showFavoriteMenu.value = false;
    nextTick(() => {
        showFavoriteMenu.value = true;
        x = e.clientX;
        y = e.clientY;
    });
    favoriteForMenu.value = favorite;
};

const addFavorite = async () => {
    const url = prompt('Enter url');
    if (url) {
        const name: string | null = prompt('Enter name');
        const url: string | null = prompt('Enter url');
        if (name && url) {
            const favorite: MFavorite = new MFavorite({
                name,
                url
            });
            await DAddFavorite(favorite, selectedGroup.value!.name);
            await getGroups();
            currentFavorites.value.push(favorite);
        }
    }
};

const openPage = (url: string) => {
    window.open(url);
};
</script>

<style lang="scss">
</style>
