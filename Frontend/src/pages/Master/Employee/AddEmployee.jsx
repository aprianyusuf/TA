import React from "react";

import { format, sub } from "date-fns";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import { Spinner } from "@/components/atoms/Spinner";
import DateTimeControl from "@/components/moleculs/Control/DateTimeControl";
import InputControl from "@/components/moleculs/Control/InputControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { MaritalOptions, ReligionOptions } from "@/schema/options";
import { AddEmployeeSchema } from "@/schema/request/Foundation/EmployeeRequestSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";

import {
	EmploymentTypeControl,
	HiredDateControl,
	PositionControl,
	SuperiorControl,
} from "./partials/FormEmployeeControl";

const AddEmployee = () => {
	const navigate = useNavigate();

	const { onSubmit: onSubmitAddEmployee, isLoading: isLoadingAddEmployee } =
		useCustomMutation({
			api: EmployeeApi.create,
			invalidateQueries: ["employees", "employeeHierarchy"],
			onError: (res) => {
				toast.error(res.message);
			},
			onSuccess: (res) => {
				toast.success(res.message);
				navigate(-1);
			},
		});

	const handleSubmit = async (data, e) => {
		data.birth_at = format(data.birth_at, "yyyy-MM-dd");
		data.hired_start_at = format(data.hired_start_at, "yyyy-MM-dd");

		if (data.hired_end_at) {
			data.hired_end_at = format(data.hired_end_at, "yyyy-MM-dd");
		}
		onSubmitAddEmployee(data, e);
	};

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Add Employee</CardTitle>
					<CardDescription className="my-3">
						Create new employee
					</CardDescription>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							first_name: "",
							last_name: "",
							position_id: null,
							report_to_id: null,
							religion: null,
							marital: null,
							employee_id: null,
							identity_number: null,
							birth_at: null,
							hired_start_at: null,
							hired_end_at: null,
							employment_type: null,
							salary: null,
						}}
						schema={AddEmployeeSchema}
						className="flex flex-col gap-3"
					>
						<div className="flex flex-col gap-2 md:flex-row">
							<InputControl label="First Name" name="first_name" />
							<InputControl label="Last Name" name="last_name" />
						</div>

						<div className="flex flex-col gap-2 md:flex-row">
							<InputControl label="Identity Number" name="identity_number" />
							<DateTimeControl
								label="Birth Date"
								name="birth_at"
								dateFormat="dd/MM/yyyy"
								datePickerOptions={{
									showYearDropdown: true,
									yearDropdownItemNumber: 55,
									minDate: sub(new Date(), { years: 55 }),
									maxDate: sub(new Date(), { years: 17 }),
								}}
							/>
						</div>

						<div className="flex flex-col gap-2 md:flex-row">
							<SelectControl
								name={"marital"}
								label={"Marital"}
								options={MaritalOptions.map((v) => ({
									label: v,
									value: v,
								}))}
							/>
							<SelectControl
								name={"religion"}
								label={"Religion"}
								options={ReligionOptions.map((v) => ({
									label: v,
									value: v,
								}))}
							/>
						</div>

						<div className="flex flex-col gap-2 md:flex-row">
							<PositionControl />
							<SuperiorControl />
						</div>

						<div className="flex flex-col gap-2 md:flex-row">
							<EmploymentTypeControl />
							<HiredDateControl />
						</div>

						<div className="flex flex-col gap-2 md:flex-row">
							<InputControl label="Base Salary" name="salary" type="number" className="w-full md:w-1/2"/>
						</div>

						<div className="flex justify-end">
							<Button disabled={isLoadingAddEmployee} className="w-40">
								{isLoadingAddEmployee ? <Spinner /> : "Add Employee"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: AddEmployee,
	menu: "MD00003",
});
