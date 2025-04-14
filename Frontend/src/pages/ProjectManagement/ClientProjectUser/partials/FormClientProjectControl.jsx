import React, { useState } from "react";

import { add, parse } from "date-fns";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import DateTimeControl from "@/components/moleculs/Control/DateTimeControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { useCustomQuery } from "@/hooks/useCustomQuery";

export const ClientUserProjectControl = ({ isDisabled, options = [] }) => {
	const { watch } = useFormContext();
	const [search, setSearch] = useState(null);

	const [projectManagerId] = watch(["project_manager_id"]);

	const { data: dataEmployee, isLoading: isLoadingEmployee } = useCustomQuery({
		api: EmployeeApi.getAll,
		queryKey: ["clientProjectUserControl", { search }],
		queryParams: { search },
		enabled: !isDisabled,
	});

	return (
		<>
			<SelectControl
				label="Employee"
				name="user_id"
				options={
					options.length
						? options
						: dataEmployee?.data
								.map((v) => ({
									label: `${v.firstName} ${v.lastName}`,
									value: v.id,
								}))
								.filter((i) => i.value !== projectManagerId)
				}
				onInputChange={(v) => setSearch(v)}
				isLoading={isLoadingEmployee}
				isDisabled={isDisabled}
			/>
		</>
	);
};

ClientUserProjectControl.propTypes = {
	isDisabled: PropTypes.bool,
	options: PropTypes.array,
};

export const ProjectDateControl = () => {
	const { watch } = useFormContext();

	const [startDate, projectStartDate, projectEndDate] = watch([
		"start_date",
		"project_start_date",
		"project_end_date",
	]);

	return (
		<div className="flex flex-col gap-2 md:flex-row">
			<DateTimeControl
				label="Start Date"
				name="start_date"
				dateFormat="dd/MM/yyyy"
				datePickerOptions={{
					minDate: parse(projectStartDate, "yyyy-MM-dd", new Date()),
					maxDate: parse(projectEndDate, "yyyy-MM-dd", new Date()),
				}}
			/>
			<DateTimeControl
				label="End Date"
				name="end_date"
				dateFormat="dd/MM/yyyy"
				datePickerOptions={{
					minDate: startDate
						? add(startDate, { days: 1 })
						: parse(projectStartDate, "yyyy-MM-dd", new Date()),
					maxDate: parse(projectEndDate, "yyyy-MM-dd", new Date()),
				}}
			/>
		</div>
	);
};
