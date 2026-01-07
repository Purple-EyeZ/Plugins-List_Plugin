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
import { type FullTheme, Sort } from "../../types";
import Search from "../Search";
import ThemeCard from "../ThemeCard";

const themeSortOptions = [
	Sort.DateNewest,
	Sort.DateOldest,
	Sort.NameAZ,
	Sort.NameZA,
];

const AnimatedIconButton = Reanimated.default.createAnimatedComponent(IconButton);

function performSearch(query: string, data: FullTheme[]): FullTheme[] {
	const preparedData = data.map(item => ({
		...item,
		authors_str: item.authors.join(" "),
		tags_str: item.tags.join(" "),
	}));

	const results = fuzzysort.go(query, preparedData, {
		keys: ["name", "description", "authors_str", "tags_str"],
		threshold: 0.3,
	});

	const boostedResults = results.map(result => {
		const nameScore = result[0]?.score ?? 0;
		const descScore = result[1]?.score ?? 0;
		const authorScore = result[2]?.score ?? 0;
		const tagScore = result[3]?.score ?? 0;

		let boostedScore = result.score;

		const NAME_THRESHOLD = 0.4;
		const DESC_THRESHOLD = 0.6;
		const AUTHOR_THRESHOLD = 0.6;
		const TAG_THRESHOLD = 0.7;

		if (nameScore > NAME_THRESHOLD) boostedScore += 100;
		if (descScore > DESC_THRESHOLD) boostedScore += 50;
		if (authorScore > AUTHOR_THRESHOLD) boostedScore += 20;
		if (tagScore > TAG_THRESHOLD) boostedScore += 10;

		return {
			...result,
			obj: result.obj,
			boostedScore,
		};
	});

	boostedResults.sort((a, b) => b.boostedScore - a.boostedScore);

	return boostedResults.map(x => x.obj as FullTheme);
}

export default () => {
	const [parsed, setParsed] = React.useState<FullTheme[] | null>(null);
	const [search, setSearch] = React.useState("");
	const [sort, setSort] = React.useState(Sort.DateNewest);

	const currentSetSort = React.useRef(setSort);
	currentSetSort.current = setSort;

	const flashlistRef = React.useRef<FlashListType<any>>();
	const inputRef = React.useRef<TextInput>();
	const [scrolledPast, setScrolledPast] = React.useState(false);

	const sortedData = React.useMemo(() => {
		if (!parsed) return [];

		if (search.length > 0) {
			return performSearch(search, parsed);
		}

		const data = [...parsed];

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
		}

		return data;
	}, [parsed, search, sort]);

	React.useEffect(() => {
		if (!parsed) {
			const url = "https://plugins-list.pages.dev/themes-data.json";

			safeFetch(url, { cache: "no-store" })
				.then(x => x.json())
				.then(setParsed)
				.catch((e) => {
					console.error("[ThemeBrowserPage] Fetch error:", e);
					showToast(
						lang.format("toast.data.theme.fail_fetch", {}),
						getAssetIDByName("CircleXIcon-primary"),
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
				<Search
					onChangeText={setSearch}
					filterSetSort={currentSetSort}
					inputRef={inputRef}
					sortOptions={themeSortOptions}
				/>
			}
			ItemSeparatorComponent={() => <RN.View style={{ height: 8 }} />}
			contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
			data={sortedData}
			estimatedItemSize={296}
			renderItem={({ item }) => <ThemeCard item={item} />}
			removeClippedSubviews
			refreshControl={
				<RN.RefreshControl
					refreshing={parsed === null}
					onRefresh={() => parsed !== null && setParsed(null)}
				/>
			}
			onScroll={e => setScrolledPast(e.nativeEvent.contentOffset.y >= 195)}
		/>
	);
};
