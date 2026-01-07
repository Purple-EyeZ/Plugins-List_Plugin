export interface FullPlugin {
	name: string;
	description: string;
	authors: string[];
	status: "working" | "broken" | "warning";
	sourceUrl?: string;
	installUrl: string;
	warningMessage?: string;
}

export interface FullTheme {
	name: string;
	description: string;
	authors: string[];
	sourceUrl: string;
	installUrl: string;
	images: string[];
	tags: string[];
}

export enum Sort {
	DateNewest = "sheet.sort.date_newest",
	DateOldest = "sheet.sort.date_oldest",
	NameAZ = "sheet.sort.name_az",
	NameZA = "sheet.sort.name_za",
	WorkingFirst = "sheet.sort.working_first",
	BrokenFirst = "sheet.sort.broken_first",
}
