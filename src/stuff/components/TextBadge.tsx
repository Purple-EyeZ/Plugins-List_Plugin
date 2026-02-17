import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import type { ViewStyle } from "react-native";

import Text from "$/components/Text";
import { Reanimated } from "$/deps";

export default function TextBadge({
	style,
	variant,
	children,
	shiny,
	isTag,
	tagColor,
}: React.PropsWithChildren<{
	style?: ViewStyle;
	variant?: "primary" | "danger" | "success" | "warning";
	shiny?: boolean;
	isTag?: boolean;
	tagColor?: string;
}>) {
	const [width, setWidth] = React.useState(0);

	if (isTag) {
		const tagStyles = stylesheet.createThemedStyleSheet({
			main: {
				flexDirection: "row",
				alignItems: "center",
				borderRadius: 999,
				paddingHorizontal: 8,
				paddingVertical: 4,
				backgroundColor: semanticColors.INPUT_BACKGROUND_DEFAULT,
				marginTop: 3,
			},
			circle: {
				width: 8,
				height: 8,
				borderRadius: 9,
				marginRight: 4,
			},
		});

		return (
			<RN.View style={[tagStyles.main, style]}>
				{tagColor && <RN.View style={[tagStyles.circle, { backgroundColor: tagColor }]} />}
				<Text
					variant="text-xxs/bold"
					color="TEXT_DEFAULT"
					style={{
						textTransform: "uppercase",
					}}
				>
					{children}
				</Text>
			</RN.View>
		);
	}

	const finalVariant = variant ?? "primary";
	const variantColors = {
		primary: {
			background: semanticColors.CONTROL_PRIMARY_BACKGROUND_DEFAULT,
			text: "CONTROL_PRIMARY_TEXT_DEFAULT",
		},
		danger: {
			background: semanticColors.STATUS_DANGER,
			text: "CONTROL_CRITICAL_PRIMARY_TEXT_DEFAULT",
		},
		success: {
			background: semanticColors.STATUS_POSITIVE,
			text: "STATUS_POSITIVE_TEXT",
		},
		warning: {
			background: semanticColors.STATUS_WARNING,
			text: "STATUS_WARNING_TEXT",
		},
	};

	const styles = stylesheet.createThemedStyleSheet({
		main: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 2147483647,
			paddingHorizontal: 6,
			paddingVertical: 3,
			backgroundColor: variantColors[finalVariant].background,
			marginTop: 3,
			overflow: "hidden",
		},
		shiner: {
			position: "absolute",
			width: 7,
			height: 80,
			backgroundColor: "#fff4",
		},
	});

	const shinyTranslate = Reanimated.useSharedValue(0);
	const randomness = React.useRef(
		1500 + Math.floor(Math.random() * 696),
	).current;

	React.useEffect(() => {
		if (width !== 0 && shiny) {
			shinyTranslate.value = Reanimated.withRepeat(
				Reanimated.withSequence(
					Reanimated.withTiming(-width, { duration: 0 }),
					Reanimated.withDelay(
						randomness,
						Reanimated.withTiming(width, {
							duration: 800,
							easing: Reanimated.Easing.inOut(Reanimated.Easing.cubic),
						}),
					),
				),
				0,
			);
		} else shinyTranslate.value = 500;
	}, [shiny, width]);

	return (
		<RN.View
			style={[styles.main, style]}
			onLayout={layout => {
				setWidth(layout.nativeEvent.layout.width * 0.5 + 4);
			}}
		>
			{shiny && width !== 0 && (
				<Reanimated.default.View
					style={[
						styles.shiner,
						{
							transform: [
								{
									rotate: "-22deg",
								},
								{ translateX: shinyTranslate },
							],
						},
					]}
				/>
			)}
			<Text
				variant="text-xxs/bold"
				align="center"
				color={variantColors[finalVariant].text}
				style={{
					textTransform: "uppercase",
				}}
			>
				{children}
			</Text>
		</RN.View>
	);
}
