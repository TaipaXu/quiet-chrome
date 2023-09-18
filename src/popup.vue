<template>
    <v-toolbar density="compact">
        <v-toolbar-title>Favorite added</v-toolbar-title>

        <v-btn icon @click="openOptoinsPage">
            <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
    </v-toolbar>
    <v-container>
        <v-row>
            <v-col>
                <v-text-field v-model="name" label="Name" density="compact" variant="solo" hide-details></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select v-model="currentGroup" label="Group" density="compact" :items="groups" item-title="label"
                    item-value="value" variant="solo"></v-select>
            </v-col>
        </v-row>
        <v-row justify="end">
            <v-col cols="auto">
                <v-btn density="comfortable" :disabled="!isFavorite" @click="remove">
                    Remove
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn density="comfortable" :disabled="isFavorite" @click="save">
                    Done
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { Ref } from 'vue';
import browser from 'webextension-polyfill';
import MGroup from '@/models/group';
import MFavorite from '@/models/favorite';
import {
    getAllGroups as DGetAllGroups,
    addFavorite as DAddFavorite,
    removeFavorite as DRemoveFavorite,
    isFavorite as DIsFavorite,
} from '@/data/favorite';

interface Option {
    label: string,
    value: string,
}

let tabId: number;
const name: Ref<string> = ref('');
const url: Ref<string> = ref('');
const currentGroup: Ref<string | null> = ref(null);
const groups: Ref<Option[]> = ref([]);
const isFavorite: Ref<boolean> = ref(false);

const init = async () => {
    const tabs: browser.Tabs.Tab[] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 1) {
        const tab: browser.Tabs.Tab = tabs[0];
        const tabTitle: string = tab.title!;
        const tabUrl: string = tab.url!;
        tabId = tab.id!;
        name.value = tabTitle;
        url.value = tabUrl;

        const dataGroups: MGroup[] = await DGetAllGroups();
        groups.value = dataGroups.map(item => ({
            label: item.name,
            value: item.name,
        }));
        if (dataGroups.length > 0) {
            currentGroup.value = dataGroups[0].name;
        }

        isFavorite.value = await DIsFavorite(tabUrl);
    }
};
init();

const save = async () => {
    const favorite: MFavorite = new MFavorite({
        name: name.value,
        url: url.value,
    });
    await DAddFavorite(favorite, currentGroup.value!);
    await browser.action.setIcon({
        tabId,
        path: {
            19: './assets/icons/favorite_filled_19.png',
            38: './assets/icons/favorite_filled_38.png',
        },
    });
    window.close();
};

const remove = async () => {
    DRemoveFavorite(url.value);
    await browser.action.setIcon({
        tabId,
        path: {
            19: './assets/icons/favorite_19.png',
            38: './assets/icons/favorite_38.png',
        },
    });
    window.close();
};

const openOptoinsPage = () => {
    browser.runtime.openOptionsPage();
}
</script>

<style lang="scss">
#app {
    width: 300px;
}
</style>
