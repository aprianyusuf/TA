import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import OrganizationApi from "@/apis/v1/MasterApi/OrganizationApi";
import PositionApi from "@/apis/v1/MasterApi/PositionApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddPositionSchema } from "@/schema/request/Foundation/PositionRequestSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";
import NotFound from "@/templates/NotFound";
import PayrollApi from "@/apis/v1/PayrollApi/PayrollApi";
import { useFieldArray, useFormContext } from "react-hook-form";

const FormBonus = () => {
	const { control } = useFormContext();

	const { fields } = useFieldArray({
		control,
		name: "bonuses",
	});

	return (
		<div className="flex flex-col gap-3">
			<p className="font-bold">Bonus</p>
			{fields.map((v, i) =>
				<div key={v.id} className="flex gap-2">
					<InputControl label={'Type'} name={`bonuses.${i}.name`} isDisabled />
					<InputControl label={'Value'} name={`bonuses.${i}.value`} />
				</div>
			)}
		</div>
	)
}

const FormDeduction = () => {
	const { control } = useFormContext();

	const { fields } = useFieldArray({
		control,
		name: "deductions",
	});

	return (
		<div className="flex flex-col gap-3">
			<p className="font-bold">Deduction</p>
			{fields.map((v, i) =>
				<div key={v.id} className="flex gap-2">
					<InputControl label={'Type'} name={`deductions.${i}.name`} isDisabled />
					<InputControl label={'Value'} name={`deductions.${i}.value`} />
				</div>
			)}
		</div>
	)
}

const EditPayroll = () => {
	const { payrollperiodid, payrollid } = useParams();
	const navigate = useNavigate();

	const {
		data: detailPayroll,
		isLoading: isLoadingDetailPayroll,
		error: errorDetailPayroll,
	} = useCustomQuery({
		api: PayrollApi.showDetailPeriod,
		queryKey: ["showDetailPeriod", { id: payrollperiodid, periodId: payrollid }],
		queryParams: { id: payrollperiodid, periodId: payrollid },
	});

	const { onSubmit: onSubmitEditPayroll, isLoading: isLoadingEditPayroll } =
		useCustomMutation({
			api: PayrollApi.update,
			invalidateQueries: ["payroll", ["payroll", { payrollid }], ["showDetailPeriod", { id: payrollperiodid, periodId: payrollid }]],
			onError: (res) => {
				toast.error(res.message);
			},
			onSuccess: (res) => {
				toast.success(res.message);
				navigate(`/payroll/payrollperiod/${payrollperiodid}`);
			},
		});

	const handleSubmit = async (data) => {
		const payload = {
			bonuses: data.bonuses.map((v) => ({ ...v, value: +v.value })),
			deductions: data.deductions.map((v) => ({ ...v, value: +v.value })),
			status: ""
		};

		onSubmitEditPayroll({ id: payrollid, ...payload });
	};

	if (isLoadingDetailPayroll) {
		return (
			<div className="flex items-center justify-center w-full h-full">
				<Spinner />
			</div>
		);
	}

	if (errorDetailPayroll || !detailPayroll.data.length) {
		return <NotFound message="Payroll not found" />;
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Edit Payroll</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							employee_id: detailPayroll.data[0].employeeId,
							payroll_period_id: payrollperiodid,
							salary: detailPayroll.data[0].salary,
							bonuses: detailPayroll.data[0].bonuses,
							// bonuses: [{ type: "JHT", value: "3.7" }],
							// deductions: [{ type: "JHT", value: "3.7" }],
							deductions: detailPayroll.data[0].deductions,
							name: `${detailPayroll.data[0].firstName} ${detailPayroll.data[0].lastName}`
						}
						}
						className="flex flex-col gap-3"
					>
						<InputControl label={'Name'} name={'name'} isDisabled />
						<InputControl label={'Salary'} name={'salary'} isDisabled />
						<FormBonus />
						<FormDeduction />

						<div className="flex justify-end">
							<Button disabled={isLoadingEditPayroll} className="w-40">
								{isLoadingEditPayroll ? <Spinner /> : "Update Payroll"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: EditPayroll,
	menu: "MD00009",
});
