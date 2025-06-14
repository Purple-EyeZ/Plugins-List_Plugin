// Based on @Nexpid's Plugin Browser: https://github.com/nexpid/RevengePlugins/tree/main/src/plugins/plugin-browser

import type { FlashList as FlashListType } from "@shopify/flash-list";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";
import fuzzysort from "fuzzysort";
import type { TextInput } from "react-native";

import { FlashList, Reanimated } from "$/deps";
import { IconButton } from "$/lib/redesign";
import { managePage } from "$/lib/ui";

import { lang } from "../..";
import { getChanges, updateChanges, run as runPluginChecker } from "../../stuff/pluginChecker";
import { properLink } from "../../stuff/util";
import type { FullPlugin } from "../../types";
import PluginCard from "../PluginCard";
import Search from "../Search";
import InfoCard from "../InfoCard";

export enum Sort {
	DateNewest = "sheet.sort.date_newest",
	DateOldest = "sheet.sort.date_oldest",
	NameAZ = "sheet.sort.name_az",
	NameZA = "sheet.sort.name_za",
	WorkingFirst = "sheet.sort.working_first",
	BrokenFirst = "sheet.sort.broken_first",
}

const AnimatedIconButton = Reanimated.default.createAnimatedComponent(IconButton);

export default () => {
	const [parsed, setParsed] = React.useState<FullPlugin[] | null>(null);
	const [search, setSearch] = React.useState("");

	const [sort, setSort] = React.useState(Sort.DateNewest);

	const currentSetSort = React.useRef(setSort);
	currentSetSort.current = setSort;

	const changes = React.useRef(getChanges());

	const flashlistRef = React.useRef<FlashListType<any>>();
	const inputRef = React.useRef<TextInput>();
	const [scrolledPast, setScrolledPast] = React.useState(false);

	const sortedData = React.useMemo(() => {
		if (!parsed) return [];

		if (search.length > 0) {
			const results = fuzzysort.go(search, parsed, {
				keys: [
					"name",
					"description",
					"authors.0",
					"authors.1",
					"authors.2",
					"installUrl"
				],
			});
			return results.map(x => x.obj);
		}

		const data = [...parsed];

		const getStatusPriority = (status: FullPlugin["status"], sortBy: Sort): number => {
			if (sortBy === Sort.WorkingFirst) {
				if (status === "working" || status === "warning") return 0;
				return 1;
			}
			if (sortBy === Sort.BrokenFirst) {
				if (status === "broken") return 0;
				return 1;
			}
			return 0;
		};

		switch (sort) {
			case Sort.DateNewest:
				data.reverse();
				break;
			case Sort.DateOldest:
				break;
			case Sort.NameAZ:
				data.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case Sort.NameZA:
				data.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case Sort.WorkingFirst:
				data.sort((a, b) => {
					const priorityA = getStatusPriority(a.status, Sort.WorkingFirst);
					const priorityB = getStatusPriority(b.status, Sort.WorkingFirst);
					if (priorityA !== priorityB) {
						return priorityA - priorityB;
					}
					return a.name.localeCompare(b.name);
				});
				break;
			case Sort.BrokenFirst:
				data.sort((a, b) => {
					const priorityA = getStatusPriority(a.status, Sort.BrokenFirst);
					const priorityB = getStatusPriority(b.status, Sort.BrokenFirst);
					if (priorityA !== priorityB) {
						return priorityA - priorityB;
					}
					return a.name.localeCompare(b.name);
				});
				break;
		}
		return data;
	}, [parsed, search, sort]);

	React.useEffect(() => {
		runPluginChecker().then(() => {
			changes.current = getChanges();
		});

		// when user exits out of the page
		return () => {
			updateChanges();
		};
	}, []);

	React.useEffect(() => {
		if (!parsed) {
			const url = "https://plugins-list.pages.dev/plugins-data.json";

			safeFetch(url, { cache: "no-store" })
				.then(x => x.json())
				.then((rawData: any[]) => {
					const adaptedData: FullPlugin[] = rawData.map((plug: any) => ({
						name: plug.name,
						description: plug.description,
						authors: plug.authors,
						status: plug.status,
						sourceUrl: plug.sourceUrl,
						installUrl: properLink(plug.installUrl),
						warningMessage: plug.warningMessage,
					}));
					setParsed(adaptedData);
				})
				.catch((e) => {
					console.error("[PluginBrowserPage] Fetch error:", e);
					showToast(
						lang.format("toast.data.fail_fetch", {}),
						getAssetIDByName("CircleXIcon-primary")
					);
				});
		}
	}, [parsed]);

	managePage(
		{
			title: lang.format("plugin.name", {}),
			headerRight: () =>
				scrolledPast
					? (
						<AnimatedIconButton
							icon={getAssetIDByName("ArrowSmallUpIcon")}
							variant="secondary"
							size="sm"
							onPress={() => (
								flashlistRef.current?.scrollToOffset({
									animated: true,
									offset: 0,
								}), inputRef.current?.focus()
							)}
							entering={Reanimated.FadeIn.duration(200)}
							exiting={Reanimated.FadeOut.duration(200)}
						/>
					)
					: null,
		},
		null,
		[scrolledPast],
	);

	return (
		<FlashList
			ListHeaderComponent={
				<>
					<InfoCard />
					<Search
						onChangeText={setSearch}
						filterSetSort={currentSetSort}
						inputRef={inputRef}
					/>
				</>
			}
			ItemSeparatorComponent={() => <RN.View style={{ height: 8 }} />}
			contentContainerStyle={{ paddingHorizontal: 10 }}
			data={sortedData}
			estimatedItemSize={113}
			renderItem={({ item }) => <PluginCard item={item} changes={changes.current} />}
			removeClippedSubviews
			refreshControl={
				<RN.RefreshControl
					refreshing={parsed === null}
					/* onRefresh doesn't seem to work with FlashList no matter how hard I try /shrug */
					onRefresh={() => parsed !== null && setParsed(null)}
				/>
			}
			onScroll={e => setScrolledPast(e.nativeEvent.contentOffset.y >= 195)}
		/>
	);
};
