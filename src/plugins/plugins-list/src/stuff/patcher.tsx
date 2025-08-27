import { plugin } from "@vendetta";
import { React } from "@vendetta/metro/common";

import TextBadge from "$/components/TextBadge";
import { patchSettingsPin } from "$/lib/pinToSettings";

import { lang } from "..";
import PluginBrowserPage from "../components/pages/PluginBrowserPage";
import { getChanges, initThing } from "./pluginChecker";
import PluginsListIcon from "../../assets/PluginsListIcon2.png";

export let pluginsEmitter: Emitter;

export default (): () => void => {
	const patches: (any)[] = [];
	patches.push(
		patchSettingsPin({
			key: plugin.manifest.name,
			icon: { uri: PluginsListIcon },
			trailing: () => {
				const changes = React.useRef(
					Object.keys(getChanges()).length,
				).current;
				if (changes > 0) {
					return <TextBadge variant="danger">{changes}</TextBadge>;
				}
			},
			title: () => lang.format("plugin.name", {}),
			predicate: () => true,
			page: PluginBrowserPage,
		}),
	);
	patches.push(initThing());
	patches.push(lang.unload);

	return () => {
		for (const x of patches) x();
	};
};
