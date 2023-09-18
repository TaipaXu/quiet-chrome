import browser from 'webextension-polyfill';
import { isFavorite } from '@/data/favorite';

browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab: browser.Tabs.Tab = await browser.tabs.get(activeInfo.tabId);
    if (await isFavorite(tab.url!)) {
        browser.action.setIcon({
            tabId: activeInfo.tabId,
            path: {
                19: './assets/icons/favorite_filled_19.png',
                38: './assets/icons/favorite_filled_38.png',
            },
        });
    } else {
        browser.action.setIcon({
            tabId: activeInfo.tabId,
            path: {
                19: './assets/icons/favorite_19.png',
                38: './assets/icons/favorite_38.png',
            },
        });
    }
});
