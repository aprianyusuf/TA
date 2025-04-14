import { add, format, parse } from "date-fns";

import { getUTCOffsetInHours } from "./helper";

export const shortenLongText = (text, maxChar = 50) =>
	text
		? text.length > maxChar
			? text.substring(0, maxChar) + "..."
			: text
		: "-";

export const capitalizeFirstLetter = (text) =>
	text ? text?.replace(/^./, text[0]?.toUpperCase()) : "";

export const numberWithDelimeter = (val, delimeter = ".") =>
	val ? val?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimeter) : "";

export const capitalizeEachWord = (str) =>
	str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

export const getInitialName = (name) => {
	const split = name.split(" ");
	return split
		.map((a) => a[0].toUpperCase())
		.slice(0, 2)
		.join("");
};

export function formatTime(timeStr) {
	const decimalTime = parseFloat(timeStr);

	const isNegative = decimalTime < 0;
	const absoluteTime = Math.abs(decimalTime);

	const hours = Math.floor(absoluteTime);

	const minutes = Math.round((absoluteTime - hours) * 60);

	const formattedHours = hours.toString().padStart(2, "0");
	const formattedMinutes = minutes.toString().padStart(2, "0");

	return `UTC ${isNegative ? "-" : "+"}${formattedHours}:${formattedMinutes}`;
}

export const toGmt = (
	time,
	timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
	fromFormat = "yyyy-MM-dd HH:mm:ss",
	toFormat,
) => {
	const date = add(parse(time, fromFormat, new Date()), {
		hours: getUTCOffsetInHours(timezone) * -1,
	});

	if (!toFormat) return date;

	return format(date, toFormat);
};
