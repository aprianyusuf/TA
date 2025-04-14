import { TABLE_FILTER_CONDITION, TABLE_FILTER_TYPE } from "@/configs/constant";

export const OrganizationFilter = [
	{
		column: "name",
		filters: [TABLE_FILTER_CONDITION.CONTAINS, TABLE_FILTER_CONDITION.EQUALS],
		type: TABLE_FILTER_TYPE.TEXT,
	},
	{
		column: "domain",
		filters: [TABLE_FILTER_CONDITION.CONTAINS, TABLE_FILTER_CONDITION.EQUALS],
		type: TABLE_FILTER_TYPE.TEXT,
	},
];
