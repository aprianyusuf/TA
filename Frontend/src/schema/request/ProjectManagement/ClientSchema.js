import { format, isAfter } from "date-fns";
import * as Yup from "yup";

export const AddClientSchema = Yup.object().shape({
	name: Yup.string().required("* Filled is required"),
});

export const AddClientProjectSchema = Yup.object().shape({
	name: Yup.string().required("* Filled is required"),
	start_date: Yup.date().required("* Filled is required"),
	end_date: Yup.date()
		.nullable()
		.test({
			name: "after-start-date",
			message: "* End Date must be after Start Date",
			test: (value, { parent }) => {
				return isAfter(
					format(value, "yyyy-MM-dd"),
					format(parent.start_date, "yyyy-MM-dd"),
				);
			},
		}),
	cut_off_timesheet_start_day: Yup.number()
		.min(1)
		.max(30)
		.required("* Filled is required"),
	cut_off_timesheet_end_day: Yup.number()
		.min(1)
		.max(30)
		.required("* Filled is required"),
	project_manager_id: Yup.string().required("* Filled is required"),
	color: Yup.string().required("* Filled is required"),
	is_requires_project_manager_approval: Yup.boolean().required(
		"* Filled is required",
	),
});

export const AddClientProjectUserSchema = Yup.object().shape({
	user_id: Yup.string().required("* Filled is required"),
	start_date: Yup.date().required("* Filled is required"),
	end_date: Yup.date()
		.nullable()
		.test({
			name: "after-start-date",
			message: "* End Date must be after Start Date",
			test: (value, { parent }) => {
				return isAfter(value, parent.start_date);
			},
		}),
});
