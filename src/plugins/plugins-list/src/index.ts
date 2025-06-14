// Based on @Nexpid's Plugin Browser: https://github.com/nexpid/RevengePlugins/tree/main/src/plugins/plugin-browser

import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import patcher from "./stuff/patcher";

export const vstorage = storage as {
	pluginCache: string[];
};

export const lang = new Lang("plugins_list");

let unpatch: any;
export default {
	onLoad: () => {
		vstorage.pluginCache ??= [];
		unpatch = patcher();
	},
	onUnload: () => unpatch?.(),
};
