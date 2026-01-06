import { findByProps } from "@vendetta/metro";
import { clipboard, React, ReactNative as RN } from "@vendetta/metro/common";
import { installTheme, removeTheme, themes } from "@vendetta/themes";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import type { Image } from "react-native";

import TextBadge from "$/components/TextBadge";

import { lang } from "..";
import type { FullTheme } from "../types";
import Card from "./Card";

const { openMediaModal } = findByProps("openMediaModal");

const tagColors: Record<string, string> = {
	dark: "#313244",
	light: "#eff1f5",
	amoled: "#000000",
	red: "#d20f39",
	green: "#3ab81e",
	blue: "#1e66f5",
	cyan: "#1aa1a8",
	pink: "#ea76cb",
	purple: "#8839ef",
	brown: "#946e48",
	grey: "#7f849c",
	orange: "#f8620c",
	yellow: "#e4d72c",
};

export default function ThemeCard({ item }: { item: FullTheme }) {
	const usableLink = item.installUrl;
	const githubLink = item.sourceUrl;
	const imageRef = React.useRef<Image>(null);

	const [statusState, setStatusState] = React.useState<{
		hasTheme: boolean;
		pending: boolean;
	}>({
		hasTheme: !!themes[usableLink],
		pending: false,
	});

	React.useEffect(() => {
		setStatusState({
			hasTheme: !!themes[usableLink],
			pending: false,
		});
	}, [usableLink]);

	const performInstall = async () => {
		if (statusState.pending) return;
		setStatusState({
			hasTheme: !!themes[usableLink],
			pending: true,
		});

		const shouldRemove = !!themes[usableLink];

		try {
			if (shouldRemove) removeTheme(usableLink);
			else await installTheme(usableLink);
		} catch (_e) {
			showToast(
				lang.format(
					shouldRemove
						? "toast.theme.delete.fail"
						: "toast.theme.install.fail",
					{ theme: item.name },
				),
				getAssetIDByName("CircleXIcon-primary"),
			);
			setStatusState(s => ({ ...s, pending: false }));
			return;
		}

		showToast(
			lang.format(
				shouldRemove
					? "toast.theme.delete.success"
					: "toast.theme.install.success",
				{ theme: item.name },
			),
			getAssetIDByName(shouldRemove ? "TrashIcon" : "DownloadIcon"),
		);

		setStatusState({
			hasTheme: !!themes[usableLink],
			pending: false,
		});
	};

	const handleImagePress = async () => {
		if (!openMediaModal || !item.images?.length || !imageRef.current) {
			return;
		}

		const sources = await Promise.all(
			item.images.map(
				uri =>
					new Promise<{ uri: string; width: number; height: number }>(resolve => {
						RN.Image.getSize(
							uri,
							(imgWidth, imgHeight) => {
								resolve({ uri, width: imgWidth, height: imgHeight });
							},
							() => {
								resolve({ uri, width: 0, height: 0 });
							},
						);
					}),
			),
		);

		imageRef.current.measure((_x, _y, width, height, pageX, pageY) => {
			openMediaModal({
				initialSources: sources,
				initialIndex: 0,
				originLayout: {
					x: pageX,
					y: pageY,
					width,
					height,
					resizeMode: "cover",
				},
				disableMediaOverlayButton: true,
			});
		});
	};

	return (
		<Card
			mainStackSpacing={8}
			headerLabel={item.name}
			headerSublabel={item.authors && `by ${item.authors.join(", ")}`}
			contentAfterSublabel={
				<RN.View
					style={{
						flexDirection: "row",
						alignItems: "center",
						flexWrap: "wrap",
						marginTop: 8,
					}}
				>
					{item.tags?.slice(0, 3).map(tag => {
						const color = tagColors[tag.toLowerCase()];
						return (
							<TextBadge
								key={tag}
								isTag
								tagColor={color}
								style={{ marginRight: 4, marginBottom: 4 }}
							>
								{tag}
							</TextBadge>
						);
					})}
				</RN.View>
			}
			descriptionLabel={item.description}
			overflowTitle={item.name}
			actions={[
				{
					label: statusState.hasTheme ? "Uninstall" : "Install",
					icon: statusState.hasTheme ? "TrashIcon" : "DownloadIcon",
					disabled: statusState.pending,
					loading: statusState.pending,
					isDestructive: statusState.hasTheme,
					onPress: performInstall,
				},
			]}
			overflowActions={[
				{
					label: lang.format(
						statusState.hasTheme ? "sheet.theme.uninstall" : "sheet.theme.install",
						{},
					),
					icon: statusState.hasTheme ? "TrashIcon" : "DownloadIcon",
					isDestructive: statusState.hasTheme,
					onPress: performInstall,
				},
				{
					label: lang.format("sheet.theme.copy_theme_link", {}),
					icon: "CopyIcon",
					onPress: () => {
						showToast(
							lang.format("toast.copy_link", {}),
							getAssetIDByName("CopyIcon"),
						);
						clipboard.setString(usableLink);
					},
				},
				...(githubLink
					? [
						{
							label: lang.format("sheet.theme.open_github", {}),
							icon: "img_account_sync_github_white",
							onPress: async () => {
								showToast(
									lang.format("toast.open_link", {}),
									getAssetIDByName("LinkExternalSmallIcon"),
								);
								if (await RN.Linking.canOpenURL(githubLink)) {
									RN.Linking.openURL(githubLink);
								}
							},
						},
					]
					: []),
			]}
		>
			{item.images?.[0] && (
				<RN.TouchableOpacity onPress={handleImagePress}>
					<RN.Image
						ref={imageRef}
						source={{ uri: item.images[0] }}
						style={{
							width: "100%",
							height: 201,
							borderRadius: 8,
							backgroundColor: semanticColors.BACKGROUND_MODIFIER_ACCENT,
						}}
						resizeMode="contain"
					/>
				</RN.TouchableOpacity>
			)}
		</Card>
	);
}
