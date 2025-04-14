import React from "react";

import MonthlyTimesheetApi from "@/apis/v1/TimesheetApi/MonthlyTimesheetApi";
import { Combobox } from "@/components/ui/Combobox";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { useBoundLocalStore } from "@/stores";

const FormViewTimesheetAs = () => {
	const { selectedAs, setTimesheetStore } = useBoundLocalStore(
		(state) => state,
	);

	const { data: dataSubordinates, isLoading: isLoadingSubordinates } =
		useCustomQuery({
			api: MonthlyTimesheetApi.getSubordinates,
			queryKey: "getSubordinates",
		});

	if (isLoadingSubordinates) {
		return null;
	}

	if (dataSubordinates.data.length === 0) {
		return null;
	}

	return (
		<>
			<Combobox
				items={[
					{ value: "My Self", label: "My Self", preview: "My Self" },
					...dataSubordinates.data.map((v) => ({
						value: v.id,
						label: (
							<span>
								{v?.name} ({v?.position}) <b>{v.pendingCount}</b>
							</span>
						),
						preview: v.name,
					})),
				]}
				onSelect={(v) => {
					setTimesheetStore("selectedAs", v.value);
				}}
				placeholder="My Self"
				placeholderEmpty="No employee found"
				value={selectedAs}
				className="w-56"
			/>
		</>
	);
};

export default FormViewTimesheetAs;
