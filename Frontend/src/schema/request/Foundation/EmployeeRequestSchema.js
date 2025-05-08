import { isAfter } from "date-fns";
import * as Yup from "yup";

import {
	EmploymentTypeOptions,
	MaritalOptions,
	ReligionOptions,
} from "@/schema/options";

export const AddEmployeeSchema = Yup.object().shape({
	first_name: Yup.string().required("* Filled is required"),
	last_name: Yup.string().required("* Filled is required"),

	marital: Yup.string()
		.oneOf(MaritalOptions, "Marital not valid")
		.required("* Filled is required"),
	religion: Yup.string()
		.oneOf(ReligionOptions, "Religion not valid")
		.required("* Filled is required"),
	position_id: Yup.string().required("* Filled is required"),
	report_to_id: Yup.string().nullable(),
	employee_id: Yup.string().nullable(),
	identity_number: Yup.string().required("* Filled is required"),
	salary: Yup.number().required("* Filled is required"),
	birth_at: Yup.date().required("* Filled is required"),
	hired_start_at: Yup.date().required("* Filled is required"),
	hired_end_at: Yup.date()
		.nullable()
		.test({
			name: "after-hired-start-date",
			message: "* Hired End Date must be after Hired Start Date",
			test: (value, { parent }) => {
				if (
					!EmploymentTypeOptions.filter((i) => i !== "Permanent").includes(
						parent.employment_type,
					)
				) {
					return true;
				}

				return (
					EmploymentTypeOptions.filter((i) => i !== "Permanent").includes(
						parent.employment_type,
					) && isAfter(value, parent.hired_start_at)
				);
			},
		})
		.test({
			name: "required",
			params: { EmploymentTypeOptions },
			message: `* Hired End Date is required if employment status is one of ${EmploymentTypeOptions.filter((i) => i !== "Permanent").join(", ")}`,
			test: (value, { parent }) => {
				if (
					!EmploymentTypeOptions.filter((i) => i !== "Permanent").includes(
						parent.employment_type,
					)
				) {
					return true;
				}

				return (
					value &&
					EmploymentTypeOptions.filter((i) => i !== "Permanent").includes(
						parent.employment_type,
					)
				);
			},
		}),
	employment_type: Yup.string()
		.oneOf(EmploymentTypeOptions, "Employment Type not valid")
		.required("* Filled is required"),
});
