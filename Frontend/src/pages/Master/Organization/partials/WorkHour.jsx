import React from "react";

import { useFormContext } from "react-hook-form";

import SelectControl from "@/components/moleculs/Control/SelectControl";

const WorkHour = () => {
	const { watch } = useFormContext();

	const [workStartAt] = watch(["work_start_at"]);

	return (
		<>
			<SelectControl
				name={"work_start_at"}
				label={"Work Start At"}
				options={Array.from({ length: 24 * 2 }).map((_, i) => {
					const hours = Math.floor(i / 2)
						.toString()
						.padStart(2, "0");
					const minutes = i % 2 === 0 ? "00" : "30";
					return {
						label: `${hours}:${minutes}`,
						value: `${hours}:${minutes}`,
					};
				})}
				placeholder={"00:00"}
			/>
			<SelectControl
				name={"work_end_at"}
				label={"Work End At"}
				options={Array.from({ length: 24 * 2 })
					.map((_, i) => {
						const hours = Math.floor(i / 2)
							.toString()
							.padStart(2, "0");
						const minutes = i % 2 === 0 ? "00" : "30";
						return {
							label: `${hours}:${minutes}`,
							value: `${hours}:${minutes}`,
						};
					})
					.filter((val) => val.value > workStartAt)}
				placeholder={"00:00"}
			/>
		</>
	);
};

export default WorkHour;
