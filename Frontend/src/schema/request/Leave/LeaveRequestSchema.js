import {
	addDays,
	addMonths,
	format,
	isAfter,
	isBefore,
	isValid,
	parse,
} from "date-fns";
import { isEqual } from "lodash";
import * as Yup from "yup";

import { calculateWorkingDays, safeFormat } from "@/services/helper";

export const AddLeaveRequestSchema = Yup.object().shape({
	key_description: Yup.string().nullable().max(255, "* Maximum 255 characters"),

	start_date_at: Yup.date().required("* Filled is required"),

	end_date_at: Yup.date().required("* Filled is required"),

	dummy_key: Yup.date()
		.nullable()
		.test({
			name: "at-least-tomorrow",
			message: "* must be at least tomorrow",
			test: (value, { parent }) => {
				const { start_date_at } = parent;

				if (!start_date_at) return true;

				const startDate = parse(
					`${safeFormat(start_date_at)}`,
					"dd/MM/yyyy",
					new Date(),
				);

				if (!isValid(startDate)) return true;

				return isAfter(startDate, addDays(new Date(), 0));
			},
		})
		.test({
			name: "within-one-month",
			message: "* cannot be more than 1 month from today",
			test: (value, { parent }) => {
				const { start_date_at } = parent;

				if (!start_date_at) return true;

				const startDate = parse(
					`${safeFormat(start_date_at)}`,
					"dd/MM/yyyy",
					new Date(),
				);

				if (!isValid(startDate)) return true;

				return (
					isBefore(startDate, addMonths(new Date(), 1)) ||
					isEqual(startDate, addMonths(new Date(), 1))
				);
			},
		})
		.test({
			name: "after-start-date",
			message: "* must be after or equal to start date",
			test: (value, { parent }) => {
				const { start_date_at, end_date_at } = parent;

				return (
					isAfter(format(end_date_at, "yyyy-MM-dd"), start_date_at) ||
					isEqual(format(end_date_at, "yyyy-MM-dd"), start_date_at)
				);
			},
		})
		.test({
			name: "min-working-day",
			message: "* The date range must include at least 1 work day",
			test: (value, { parent }) => {
				const { start_date_at, end_date_at } = parent;
				if (!start_date_at || !end_date_at) return true;

				const startDate = parse(
					`${safeFormat(start_date_at)}`,
					"dd/MM/yyyy",
					new Date(),
				);
				const endDate = parse(
					`${safeFormat(end_date_at)}`,
					"dd/MM/yyyy",
					new Date(),
				);

				if (!isValid(startDate) || !isValid(endDate)) return true;

				const workDays = calculateWorkingDays(startDate, endDate);
				return workDays >= 1;
			},
		}),
});
