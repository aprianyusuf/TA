import { Calendar, CalendarClock, Columns3, Columns4 } from "lucide-react";

import { EMAIL, PASSWORD } from "@/configs/env";

export const _DEV_LOGIN = {
	PASSWORD,
	EMAIL,
};

export const TABLE_FILTER_CONDITION = {
	CONTAINS: "contains",
	EQUALS: "equals",
	DATE: "date",
	DATE_BETWEEN: "date_between",
	DATE_BEFORE: "date_before",
	DATE_AFTER: "date_after",
	OPTION: "option",
	MULTIPLE_OPTION: "multiple_option",
};

export const TABLE_FILTER_TYPE = {
	TEXT: "text",
	DATE: "date",
	INTEGER: "integer",
	ARRAY: "array",
};

export const RESPONSE_CODE = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHENTICATED: 401,
	UNAUTHORIZED: 403,
	NOT_FOUND: 404,
	UNPROCESSABLE_ENTITY: 422,
};

export const CALENDAR_VIEW = [
	{ value: "month", label: "Month", Icon: Calendar, isWorkWeek: true },
	{ value: "week", label: "Week", Icon: Columns4, isWorkWeek: false },
	{ value: "week", label: "Work Week", Icon: Columns3, isWorkWeek: true },
	{ value: "day", label: "Day", Icon: CalendarClock, isWorkWeek: true },
];

export function getTimeZones() {
	const timeZones = Intl.supportedValuesOf("timeZone");

	const timeZonesWithOffsets = timeZones.map((timeZone) => {
		const now = new Date();

		const localTime = new Date(now.toLocaleString("en-US", { timeZone }));
		const offsetMilliseconds = localTime - now;
		const offsetMinutes =
			offsetMilliseconds / (1000 * 60) + new Date().getTimezoneOffset() * -1;

		const sign = offsetMinutes >= 0 ? "+" : "-";
		const absoluteMinutes = Math.abs(offsetMinutes);
		const minutes = Math.round(absoluteMinutes % 60)
			.toString()
			.padStart(2, "0");
		const hours = (
			Math.floor(absoluteMinutes / 60) + (minutes === "60" ? 1 : 0)
		)
			.toString()
			.padStart(2, "0");

		const formattedOffset = `${hours === "00" && minutes === "00" ? "" : sign}${hours}:${minutes === "60" ? "00" : minutes}`;

		const label = timeZone
			.split("/")
			[timeZone.split("/").length - 1].replace(/_/g, " ");

		return {
			label: `(UTC ${formattedOffset}) ${label}`,
			value: timeZone,
			offsetMinutes,
		};
	});

	return timeZonesWithOffsets
		.sort((a, b) => a.offsetMinutes - b.offsetMinutes)
		.map(({ label, value }) => ({ label, value }));
}

export const TIMESHEET_STATUS = {
	DRAFT: 0,
	SUBMIT: 1,
	REJECTED: 2,
	REVISED: 3,
	COMPLETED: 4,
};

export const TIMESHEET_APPROVAL_STATUS = {
	WAITING: 0,
	PENDING: 1,
	APPROVED: 2,
	REJECTED: 3,
	REVISED: 4,
	SUBMIT: 5,
	RESUBMIT: 6,
	COMPLETED: 7,
};
