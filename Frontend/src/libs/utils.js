import { clsx } from "clsx";
import camelCase from "lodash/camelCase";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const camelizeKeys = (obj) => {
	if (Array.isArray(obj)) {
		return obj.map((v) => camelizeKeys(v));
	} else if (obj != null && obj.constructor === Object) {
		return Object.keys(obj).reduce(
			(result, key) => ({
				...result,
				[camelCase(key)]: camelizeKeys(obj[key]),
			}),
			{},
		);
	}
	return obj;
};
