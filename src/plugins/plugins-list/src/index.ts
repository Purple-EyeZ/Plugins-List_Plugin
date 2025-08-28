// Based on @Nexpid's Plugin Browser: https://github.com/nexpid/RevengePlugins/tree/main/src/plugins/plugin-browser

import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import patcher from "./stuff/patcher";

export const vstorage = storage as {
	state: {
		// prevent cloud sync from syncing this
		__no_sync: true;
		pluginCache: string[];
	};
};

export const lang = new Lang("plugins_list");

export function onLoad() {
	storage.state ??= {};
	vstorage.state.__no_sync = true;
	vstorage.state.pluginCache ??= storage.pluginCache ?? [];

	delete storage.pluginCache;
}

export const onUnload = patcher();
