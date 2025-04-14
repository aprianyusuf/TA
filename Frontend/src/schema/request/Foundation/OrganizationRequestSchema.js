import { format, isAfter, parse } from "date-fns";
import * as Yup from "yup";

export const AddOrganizationSchema = Yup.object().shape({
	name: Yup.string().required("* Filled is required"),
	domain: Yup.string().required("* Filled is required"),
	address: Yup.string().required("* Filled is required"),
	cut_off_timesheet_start_day: Yup.number()
		.min(1)
		.max(30)
		.required("* Filled is required"),
	cut_off_timesheet_end_day: Yup.number()
		.min(1)
		.max(30)
		.required("* Filled is required"),
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
	work_start_at: Yup.string()
		.required("* Filled is required")
		.test({
			name: "is-valid-time",
			message: "* Select valid start time",
			test: (value) => {
				try {
					return parse(
						`${format(new Date(), "yyyy-MM-dd")} ${value}`,
						"yyyy-MM-dd HH:mm",
						new Date(),
					);
				} catch (_) {
					return false;
				}
			},
		}),
	work_end_at: Yup.string()
		.required("* Filled is required")
		.test({
			name: "is-valid-time",
			message: "* Select valid end time",
			test: (value) => {
				try {
					return parse(
						`${format(new Date(), "yyyy-MM-dd")} ${value}`,
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
							`${format(new Date(), "yyyy-MM-dd")} ${value}`,
							"yyyy-MM-dd HH:mm",
							new Date(),
						),
						parse(
							`${format(new Date(), "yyyy-MM-dd")} ${parent.work_start_at}`,
							"yyyy-MM-dd HH:mm",
							new Date(),
						),
					);
				} catch (_) {
					return false;
				}
			},
		}),
});
