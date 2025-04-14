import { format, isAfter, isEqual, parse } from "date-fns";
import * as Yup from "yup";

export const TimesheetSchema = Yup.object().shape({
	title: Yup.string().required("* Filled is required"),
	timezone: Yup.string()
		.required("* Filled is required")
		.test({
			name: "is valid timezone",
			message: "* Selected timezone is not valid",
			test: (value) => {
				try {
					Intl.DateTimeFormat(undefined, { timeZone: value });
					return true;
				} catch (_) {
					return false;
				}
			},
		}),
	start_date_at: Yup.date().required("* Filled is required"),
	end_date_at: Yup.date()
		.nullable()
		.test({
			name: "after-start-date",
			message: "* End Date must be after or equal to Start Date",
			test: (value, { parent }) => {
				const startDate = format(parent.start_date_at, "yyyy-MM-dd");
				return (
					isAfter(format(value, "yyyy-MM-dd"), startDate) ||
					isEqual(format(value, "yyyy-MM-dd"), startDate)
				);
			},
		}),
	start_time_at: Yup.string()
		.required("* Filled is required")
		.test({
			name: "is-valid-time",
			message: "* Select valid start time",
			test: (value, { parent }) => {
				try {
					return parse(
						`${format(parent.start_date_at, "yyyy-MM-dd")} ${value}`,
						"yyyy-MM-dd HH:mm",
						new Date(),
					);
				} catch (_) {
					return false;
				}
			},
		}),
	end_time_at: Yup.string()
		.required("* Filled is required")
		.test({
			name: "is-valid-time",
			message: "* Select valid end time",
			test: (value, { parent }) => {
				try {
					return parse(
						`${format(parent.end_date_at, "yyyy-MM-dd")} ${value}`,
						"yyyy-MM-dd HH:mm",
						new Date(),
					);
				} catch (_) {
					return false;
				}
			},
		})
		.test({
			name: "is-after-start-time",
			message: "* End Time must be after Start Time",
			test: (value, { parent }) => {
				try {
					return isAfter(
						parse(
							`${format(parent.end_date_at, "yyyy-MM-dd")} ${value}`,
							"yyyy-MM-dd HH:mm",
							new Date(),
						),
						parse(
							`${format(parent.start_date_at, "yyyy-MM-dd")} ${parent.start_time_at}`,
							"yyyy-MM-dd HH:mm",
							new Date(),
						),
					);
				} catch (_) {
					return false;
				}
			},
		}),
	client_project_id: Yup.string().nullable(),
	description: Yup.string().nullable(),
});
