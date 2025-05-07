import React from "react";

import { format, sub } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import { Spinner } from "@/components/atoms/Spinner";
import DateTimeControl from "@/components/moleculs/Control/DateTimeControl";
import InputControl from "@/components/moleculs/Control/InputControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { MaritalOptions, ReligionOptions } from "@/schema/options";
import { AddEmployeeSchema } from "@/schema/request/Foundation/EmployeeRequestSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";
import NotFound from "@/templates/NotFound";
import { EmploymentTypeControl, HiredDateControl, PositionControl, SuperiorControl } from "@/pages/Master/Employee/partials/FormEmployeeControl";
import PayrollApi from "@/apis/v1/PayrollApi/PayrollApi";

const PayrollShow = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	
	const {
		data: detailEmployee,
		isLoading: isLoadingDetailEmployee,
		error: errorDetailEmployee,
	} = useCustomQuery({
		api: EmployeeApi.show,
		queryKey: ["employee", { id }],
		queryParams: { id },
	});

	const { onSubmit: onSubmitEditEmployee, isLoading: isLoadingEditEmployee } =
		useCustomMutation({
			api: EmployeeApi.update,
			invalidateQueries: [
				"employees",
				"employeeHierarchy",
				["employee", { id }],
			],
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

		onSubmitEditEmployee(data, e);
	};

	if (isLoadingDetailEmployee) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (errorDetailEmployee) {
		return <NotFound message={errorDetailEmployee.message} />;
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Edit Employee</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							id,
							first_name: detailEmployee.data.firstName,
							last_name: detailEmployee.data.lastName,
							position_id: detailEmployee.data.positionId,
							report_to_id: detailEmployee.data?.reportToId || null,
							religion: detailEmployee.data.religion,
							marital: detailEmployee.data.marital,
							identity_number: detailEmployee.data.identityNumber,
							birth_at: detailEmployee.data.birthAt,
							hired_start_at: detailEmployee.data.hiredStartAt,
							hired_end_at: detailEmployee.data.hiredEndAt,
							employment_type: detailEmployee.data.employmentType,
						}}
						schema={AddEmployeeSchema}
						className="flex flex-col gap-3"
					>
						<div className="flex gap-2">
							<InputControl label="First Name" name="first_name" />
							<InputControl label="Last Name" name="last_name" />
						</div>

						<div className="flex gap-2">
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

						<div className="flex gap-2">
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

						<div className="flex gap-2">
							<PositionControl />
							<SuperiorControl />
						</div>

						<div className="flex gap-2">
							<EmploymentTypeControl />
							<HiredDateControl />
						</div>

						<div className="flex justify-end">
							<Button disabled={isLoadingEditEmployee} className="w-40">
								{isLoadingEditEmployee ? <Spinner /> : "Update Employee"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: PayrollShow,
	menu: "MD00025",
});
