import {
	addMinutes,
	differenceInMinutes,
	setMilliseconds,
	setMinutes,
	setSeconds,
} from "date-fns";
import { jwtDecode } from "jwt-decode";
import { differenceInCalendarDays } from "date-fns";
import FileApi from "@/apis/v1/FileApi";
import { useBoundStore } from "@/stores";

export const isNullOrEmpty = (obj) => {
	try {
		let json = {};
		let arr = [];
		if (
			obj === null ||
			obj === "" ||
			obj === undefined ||
			((json.constructor === obj.constructor ||
				arr.constructor === obj.constructor) &&
				Object.keys(obj).length === 0) ||
			(obj && obj.length === 0)
		) {
			return true;
		} else {
			return false;
		}
	} catch (_) {
		return true;
	}
};

export const getPaginationPage = (count = 1, pageSize) => {
	const mod = count % pageSize;
	const getNext = mod !== 0 ? 1 : 0;
	const totalPage = parseInt(count / pageSize) + getNext;

	return totalPage;
};

export const paginationQuery = ({ pageIndex, pageSize }) => {
	return {
		size: pageSize,
		page: pageIndex + 1,
	};
};

export const getBlobFile = async (id) => {
	const mimeType = id?.split(".");
	let blobType = ["jpg", "jpeg", "png"].includes(mimeType.at(-1))
		? `image/${mimeType.at(-1)}`
		: "application/pdf";

	const { data } = await FileApi.getFile({ id });

	const res = await fetch(data.url);
	const blob = await res.blob();

	return { file: new File([blob], id, { type: blobType }), url: data.url, id };
};

export const openFileOnNewPage = async (key, isDirect = false) => {
	if (isDirect) {
		return window.open(key, "_blank");
	}

	const { data } = await FileApi.getPresignedGet({ key });
	return window.open(data.url, "_blank");
};

export function removeNullUndefinedObject(obj) {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		if (value !== null && value !== undefined && value !== "") {
			acc[key] =
				typeof value === "object" ? removeNullUndefinedObject(value) : value;
		}
		return acc;
	}, {});
}

export async function base64toBlob(dataUrl, fileName, type = "image/png") {
	const res = await fetch(dataUrl);
	const blob = await res.blob();
	return new File([blob], fileName, { type });
}

export const isUserCan = (permission) => {
	const token = useBoundStore.getState()?.token;

	try {
		const decoded = jwtDecode(token);

		const permissions = decoded.user.permission;

		return permissions.includes(permission);
	} catch {
		return false;
	}
};

export function getNearest30Minutes() {
	const now = new Date();

	const minutes = now.getMinutes();
	const nearest30 =
		minutes % 30 === 0 ? minutes : Math.round(minutes / 30) * 30;

	const adjustedTime = setMilliseconds(
		setSeconds(setMinutes(now, nearest30 > 59 ? 0 : nearest30), 0),
		0,
	);

	const finalTime =
		nearest30 > 59 ? addMinutes(adjustedTime, 60) : adjustedTime;

	return finalTime;
}

export function calculateTimeDifference(startDate, endDate) {
	const totalMinutes = differenceInMinutes(endDate, startDate);

	const days = Math.floor(totalMinutes / (24 * 60));
	const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
	const minutes = totalMinutes % 60;

	const result = [
		days > 0 ? `${days}d` : null,
		hours > 0 ? `${hours}h` : null,
		minutes > 0 ? `${minutes}m` : null,
	]
		.filter(Boolean)
		.join(" ");

	return result;
}

export function calculateTimeDifferenceDays(startDate, endDate) {
	const days = differenceInCalendarDays(endDate, startDate);
	return `${days}d`;
}

function invertHexColor(hex) {
	hex = hex.replace("#", "");

	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	r = (255 - r).toString(16).padStart(2, "0");
	g = (255 - g).toString(16).padStart(2, "0");
	b = (255 - b).toString(16).padStart(2, "0");

	return `#${r}${g}${b}`;
}

function getLuminance(color) {
	if (color.startsWith("#")) {
		color = color.replace("#", "");
		let r = parseInt(color.substring(0, 2), 16) / 255;
		let g = parseInt(color.substring(2, 4), 16) / 255;
		let b = parseInt(color.substring(4, 6), 16) / 255;

		const a = [r, g, b].map(function (v) {
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		});

		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}

	const rgba = color
		.replace(/^rgba?\(|\s+|\)$/g, "")
		.split(",")
		.map((v, i) => (i < 3 ? parseInt(v, 10) / 255 : parseFloat(v)));

	const [r, g, b] = rgba;
	const a = [r, g, b].map(function (v) {
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});

	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(color1, color2) {
	const lum1 = getLuminance(color1) + 0.05;
	const lum2 = getLuminance(color2) + 0.05;
	return lum1 > lum2 ? lum1 / lum2 : lum2 / lum1;
}

function invertRgba(rgba, alpha = 1) {
	const [r, g, b] = rgba
		.replace(/^rgba?\(|\s+|\)$/g, "")
		.split(",")
		.map((value, index) =>
			index < 3 ? parseInt(value, 10) : parseFloat(value),
		);

	const invertedR = 255 - r;
	const invertedG = 255 - g;
	const invertedB = 255 - b;

	return `rgba(${invertedR}, ${invertedG}, ${invertedB}, ${alpha})`;
}

export function getTextColorFromBackground(color) {
	let invertedColor = color.includes("#")
		? invertHexColor(color)
		: invertRgba(color);

	const contrast = getContrastRatio(color, invertedColor);

	if (contrast < 4.5) {
		return getLuminance(color) > 0.5 ? "#000000" : "#ffffff";
	}

	return invertedColor;
}

export function getUTCOffsetInHours(timeZone) {
	const now = new Date();

	const localTime = new Date(now.toLocaleString("en-US", { timeZone }));

	const offsetMilliseconds = localTime - now;

	const offsetHours =
		((offsetMilliseconds / (1000 * 60) + new Date().getTimezoneOffset() * -1) /
			60) *
		-1;
	return parseFloat(parseFloat(offsetHours).toFixed(2));
}

export function hexToRgb(hex, alpha = 1) {
	hex = hex.replace(/^#/, "");

	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((char) => char + char)
			.join("");
	}

	return `rgba(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}, ${alpha})`;
}
