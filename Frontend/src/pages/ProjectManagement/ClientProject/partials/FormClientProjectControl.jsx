import React, { useState } from "react";

import { sub } from "date-fns";
import { add } from "lodash";
import { useFormContext } from "react-hook-form";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import CheckboxControl from "@/components/moleculs/Control/CheckboxControl";
import DateTimeControl from "@/components/moleculs/Control/DateTimeControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCustomQuery } from "@/hooks/useCustomQuery";

export const ProjectManagerControl = () => {
	const [search, setSearch] = useState(null);

	const { data: dataEmployee, isLoading: isLoadingEmployee } = useCustomQuery({
		api: EmployeeApi.getAll,
		queryKey: ["projectManagerControl", { search }],
		queryParams: { search },
	});

	return (
		<>
			<SelectControl
				label="Project Manager"
				name="project_manager_id"
				options={dataEmployee?.data.map((v) => ({
					label: `${v.firstName} ${v.lastName}`,
					value: v.id,
				}))}
				onInputChange={(v) => setSearch(v)}
				isLoading={isLoadingEmployee}
			/>
		</>
	);
};

export const ProjectDateControl = () => {
	const { watch } = useFormContext();

	const [startDate] = watch(["start_date"]);

	return (
		<div className="flex flex-col gap-2 md:flex-row">
			<DateTimeControl
				label="Start Date"
				name="start_date"
				dateFormat="dd/MM/yyyy"
				datePickerOptions={{
					showYearDropdown: true,
					yearDropdownItemNumber: 1,
					minDate: sub(new Date(), { years: 1 }),
					maxDate: add(new Date(), { years: 5 }),
				}}
			/>
			<DateTimeControl
				label="End Date"
				name="end_date"
				dateFormat="dd/MM/yyyy"
				datePickerOptions={{
					showYearDropdown: true,
					yearDropdownItemNumber: 1,
					minDate: add(startDate, { days: 1 }),
				}}
			/>
		</div>
	);
};

export const ProjectTimesheetConfiguration = () => {
	return (
		<Card className="p-0">
			<CardHeader className="p-3">
				<CardTitle>Timesheet Configuration</CardTitle>
			</CardHeader>
			<CardContent>
				<CheckboxControl
					name="is_requires_project_manager_approval"
					label="Is Required Project Manager Approval"
					hint={
						"Approval by the project manager is needed when a project is selected"
					}
				/>
			</CardContent>
		</Card>
	);
};
