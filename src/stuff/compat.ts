// This should be removed later.
import { semanticColors } from "@vendetta/ui";

const isV309Plus = !!semanticColors.TEXT_STRONG;

const isV310Plus = !!semanticColors.CARD_BACKGROUND_DEFAULT;

export const compatColors = {
	TEXT_STRONG: isV309Plus ? "TEXT_STRONG" : "HEADER_PRIMARY",
	TEXT_DEFAULT: isV309Plus ? "TEXT_DEFAULT" : "TEXT_NORMAL",

	CARD_BACKGROUND_DEFAULT: isV310Plus ? "CARD_BACKGROUND_DEFAULT" : "CARD_PRIMARY_BG",
	BORDER_MUTED: isV310Plus ? "BORDER_MUTED" : "BORDER_FAINT",
	INTERACTIVE_ICON_DEFAULT: isV310Plus ? "INTERACTIVE_ICON_DEFAULT" : "INTERACTIVE_NORMAL",
};
