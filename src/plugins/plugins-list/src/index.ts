import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import { Settings } from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = storage as {
	pluginCache: string[];
	dangerZone: boolean;
};

export const lang = new Lang("plugin_browser");

let unpatch: any;
export default {
	onLoad: () => {
		vstorage.pluginCache ??= [];
		vstorage.dangerZone ??= false;
		unpatch = patcher();
	},
	onUnload: () => unpatch?.(),
	settings: Settings,
};
