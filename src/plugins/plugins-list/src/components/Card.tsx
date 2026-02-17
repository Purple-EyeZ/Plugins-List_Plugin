// https://raw.githubusercontent.com/pyoncord/Bunny/dev/src/core/ui/settings/pages/Plugins/PluginCard.tsx
// this is a modified version with some plugin browser specific changes

import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { rawColors, semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

import { compatColors } from "$/compat";
import { hideActionSheet, showSimpleActionSheet } from "$/components/ActionSheet";
import Text from "$/components/Text";
import { Reanimated } from "$/deps";
import { IconButton, Stack } from "$/lib/redesign";
import { lerp } from "$/types";

const { FormRow } = Forms;

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?

const styles = stylesheet.createThemedStyleSheet({
	card: {
		padding: 16,
		borderRadius: 16,
		borderColor: semanticColors[compatColors.BORDER_MUTED],
		borderWidth: 1,
		backgroundColor: semanticColors[compatColors.CARD_BACKGROUND_DEFAULT],
	},
	content: {
		flexDirection: "row",
		alignItems: "flex-start",
		flex: 1,
	},
	title: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		flexShrink: 1,
	},
	pluginIcon: {
		tintColor: semanticColors.LOGO_PRIMARY,
		width: 18,
		height: 18,
	},
	actions: {
		flexDirection: "row-reverse",
		alignItems: "center",
		gap: 5,
	},
});

interface Action {
	label: string;
	icon: string;
	disabled?: boolean;
	isDestructive?: boolean;
	loading?: boolean;
	onPress: () => void;
}

type OverflowAction = Omit<Action, "loading">;

interface CardProps {
	headerLabel: React.ReactNode;
	headerSuffix?: React.ReactNode;
	headerSublabel?: React.ReactNode;
	contentAfterSublabel?: React.ReactNode;
	headerIcon?: number;
	descriptionLabel?: string;
	actions: Action[];
	overflowTitle: string;
	overflowActions: OverflowAction[];
	highlight?: boolean;
	disabled?: boolean;
	children?: React.ReactNode;
	mainStackSpacing?: number;
}

export default function Card({
	headerLabel,
	headerSuffix,
	headerSublabel,
	contentAfterSublabel,
	headerIcon,
	descriptionLabel,
	actions,
	overflowTitle,
	overflowActions,
	highlight,
	disabled,
	children,
	mainStackSpacing,
}: CardProps) {
	const baseColor = styles.card.backgroundColor as string;
	const highlightColor = lerp(
		baseColor,
		rawColors.BRAND_500,
		0.08,
	) as any as string;

	const color = Reanimated.useSharedValue(baseColor);

	React.useEffect(() => {
		color.value = baseColor;
		if (highlight) {
			color.value = Reanimated.withSequence(
				Reanimated.withTiming(highlightColor, {
					duration: 500,
					easing: Reanimated.Easing.cubic,
				}),
				Reanimated.withTiming(baseColor, {
					duration: 500,
					easing: Reanimated.Easing.cubic,
				}),
			);
		}
	}, [highlight]);

	return (
		<Reanimated.default.View
			style={[
				styles.card,
				{
					backgroundColor: color,
				},
				disabled && { opacity: 0.5 },
			]}
		>
			<Stack spacing={mainStackSpacing ?? 16}>
				{children}
				<RN.View style={styles.content}>
					<Stack spacing={0} style={{ flex: 1 }}>
						<RN.View style={styles.title}>
							{headerIcon && (
								<RN.Image
									style={styles.pluginIcon}
									resizeMode="cover"
									source={headerIcon}
								/>
							)}
							<Text
								variant="heading-lg/semibold"
								color={compatColors.TEXT_STRONG}
								lineClamp={1}
								ellipsis="tail"
								style={{ flexShrink: 1 }}
							>
								{headerLabel}
							</Text>
							{headerSuffix}
						</RN.View>
						{headerSublabel && (
							<Text variant="text-md/semibold" color="TEXT_MUTED">
								{headerSublabel}
							</Text>
						)}
						{contentAfterSublabel}
					</Stack>
					<RN.View>
						<Stack spacing={5} direction="horizontal">
							{actions?.map(
								({
									label,
									icon,
									onPress,
									isDestructive,
									loading,
									disabled: actionDisabled,
								}) => (
									<IconButton
										key={label}
										onPress={onPress}
										disabled={actionDisabled}
										loading={loading}
										size="sm"
										variant={isDestructive
											? "destructive"
											: "secondary"}
										icon={getAssetIDByName(icon)}
									/>
								),
							)}
							{overflowActions && (
								<IconButton
									onPress={() => {
										showSimpleActionSheet({
											key: "CardOverflow",
											header: {
												title: overflowTitle,
												icon: headerIcon
													&& headerIcon && (
													<FormRow.Icon
														source={headerIcon}
													/>
												),
												onClose: hideActionSheet,
											},
											options: overflowActions?.map(
												i => ({
													...i,
													icon: getAssetIDByName(
														i.icon,
													),
												}),
											),
										});
									}}
									size="sm"
									variant="secondary"
									icon={getAssetIDByName(
										"CircleInformationIcon-primary",
									)}
								/>
							)}
						</Stack>
					</RN.View>
				</RN.View>
				{descriptionLabel && (
					<Text variant="text-md/medium" color={compatColors.TEXT_DEFAULT}>
						{descriptionLabel}
					</Text>
				)}
			</Stack>
		</Reanimated.default.View>
	);
}
