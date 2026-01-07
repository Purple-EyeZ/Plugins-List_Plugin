import { find, findByProps } from "@vendetta/metro";
import { type React, ReactNative as RN } from "@vendetta/metro/common";

import type {
	SegmentedControlItem,
	SegmentedControlState,
	SegmentedControlStateArgs,
} from "../types";

interface SegmentedControlProps {
	state: SegmentedControlState;
	variant?: string;
}
type SegmentedControlComponentType = React.FC<SegmentedControlProps>;

interface SegmentedControlPagesProps {
	state: SegmentedControlState;
}
type SegmentedControlPagesComponentType = React.FC<SegmentedControlPagesProps>;

const SegmentedControlComponent = (findByProps("SegmentedControl")?.SegmentedControl
	?? find(x => x.render?.name === "SegmentedControl")) as SegmentedControlComponentType;

const SegmentedControlPages = (findByProps("SegmentedControlPages")
	?.SegmentedControlPages
	?? find(
		x => x.render?.name === "SegmentedControlPages",
	)) as SegmentedControlPagesComponentType;

const { useSegmentedControlState } = findByProps("useSegmentedControlState") as {
	useSegmentedControlState: (
		arg: SegmentedControlStateArgs,
	) => SegmentedControlState;
};

interface Props {
	items: SegmentedControlItem[];
	defaultIndex?: number;
}

export default function SegmentedControl({ items, defaultIndex }: Props) {
	const { width } = RN.useWindowDimensions();
	const state = useSegmentedControlState({
		items,
		pageWidth: width,
		defaultIndex: defaultIndex ?? 0,
	});

	return (
		<>
			<RN.View
				style={{ paddingHorizontal: 16, marginTop: 10, marginBottom: 10 }}
			>
				<SegmentedControlComponent state={state} />
			</RN.View>
			<SegmentedControlPages state={state} />
		</>
	);
}
