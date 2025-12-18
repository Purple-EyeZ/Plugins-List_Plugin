// Based on: https://github.com/revenge-mod/revenge-bundle/blob/main/src/core/ui/settings/pages/Plugins/index.tsx

import Text from "$/components/Text";
import { IconButton } from "$/lib/redesign";
import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

export default function InfoCard() {
	const styles = stylesheet.createThemedStyleSheet({
		card: {
			padding: 16,
			borderRadius: 16,
			borderColor: semanticColors.BORDER_FAINT,
			borderWidth: 1,
			backgroundColor: semanticColors.CARD_PRIMARY_BG,
			marginTop: 8,
			marginBottom: 8,
			marginHorizontal: 10,
		},
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			flexDirection: "row",
		},
		textContainer: {
			gap: 6,
			flexShrink: 1,
		},
		buttonContainer: {
			marginLeft: "auto",
		},
	});

	return (
		<RN.View style={styles.card}>
			<RN.View style={styles.container}>
				<RN.View style={styles.textContainer}>
					<Text variant="heading-md/bold" color="TEXT_STRONG">
						Unproxied Plugins List
					</Text>
					<Text variant="text-sm/medium" color="TEXT_MUTED">
						All plugins in this list are UNPROXIED. If you don't trust these plugins, don't install
						them!
					</Text>
				</RN.View>
				<RN.View style={styles.buttonContainer}>
					<IconButton
						size="sm"
						variant="secondary"
						icon={getAssetIDByName("CircleInformationIcon-primary")}
						style={{ marginLeft: 8 }}
						onPress={() => RN.Linking.openURL("https://plugins-list.pages.dev/About/")}
					/>
				</RN.View>
			</RN.View>
		</RN.View>
	);
}
