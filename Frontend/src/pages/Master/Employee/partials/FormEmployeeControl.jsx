import React, { useEffect, useState } from "react";

import { add, sub } from "date-fns";
import { useFormContext } from "react-hook-form";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import PositionApi from "@/apis/v1/MasterApi/PositionApi";
import DateTimeControl from "@/components/moleculs/Control/DateTimeControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { EmploymentTypeOptions } from "@/schema/options";

export const PositionControl = () => {
	const { setValue, watch } = useFormContext();
	const [search, setSearch] = useState(null);

	const { data: dataPosition, isLoading: isLoadingPosition } = useCustomQuery({
		api: PositionApi.getAll,
		queryKey: ["positions", { search }],
		queryParams: { search },
	});

	return (
		<>
			<SelectControl
				label="Position"
				name="position_id"
				options={dataPosition?.data?.map((v) => ({
					value: v.id,
					label: v.name,
				}))}
				onInputChange={(v) => setSearch(v)}
				isLoading={isLoadingPosition}
				setter={() => setValue("report_to_id", null)}
			/>
		</>
	);
};

export const SuperiorControl = () => {
	const { watch } = useFormContext();
	const [search, setSearch] = useState(null);

	const [position] = watch(["position_id"]);

	const { data: dataPosition, isLoading: isLoadingPosition } = useCustomQuery({
		api: EmployeeApi.getEmployeeByPosition,
		queryKey: ["employeeByPosition", { search, position_id: position }],
		queryParams: { search, position_id: position },
		enabled: !!position,
	});

	return (
		<>
			<SelectControl
				label="Superior"
				name="report_to_id"
				options={dataPosition?.data}
				onInputChange={(v) => setSearch(v)}
				isLoading={isLoadingPosition}
				isClearable
			/>
		</>
	);
};

export const EmploymentTypeControl = () => {
	return (
		<SelectControl
			label="Employment Type"
			name="employment_type"
			options={EmploymentTypeOptions.map((v) => ({
				label: v,
				value: v,
			}))}
			className={"w-1/2"}
		/>
	);
};

export const HiredDateControl = () => {
	const { watch, setValue } = useFormContext();

	const [employementType, hiredStartAt] = watch([
		"employment_type",
		"hired_start_at",
	]);

	useEffect(() => {
		if (
			employementType === EmploymentTypeOptions.find((i) => i !== "Permanent")
		) {
			setValue("hired_end_at", null);
		}
	}, [employementType]);

	return (
		<div className="flex w-1/2 flex-col gap-2 md:flex-row">
			<DateTimeControl
				label="Hired Start Date"
				name="hired_start_at"
				dateFormat="dd/MM/yyyy"
				datePickerOptions={{
					showYearDropdown: true,
					yearDropdownItemNumber: 1,
					minDate: sub(new Date(), { years: 1 }),
					maxDate: add(new Date(), { years: 1 }),
				}}
			/>
			{EmploymentTypeOptions.filter((i) => i !== "Permanent").includes(
				employementType,
			) ? (
				<DateTimeControl
					label="Hired End Date"
					name="hired_end_at"
					dateFormat="dd/MM/yyyy"
					datePickerOptions={{
						showYearDropdown: true,
						yearDropdownItemNumber: 1,
						minDate: add(hiredStartAt, { days: 1 }),
					}}
				/>
			) : null}
		</div>
	);
};
