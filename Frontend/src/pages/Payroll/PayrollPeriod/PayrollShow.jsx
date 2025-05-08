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

const EditPayroll = () => {
	const { payrollperiodid, payrollid } = useParams();
	const navigate = useNavigate();
	// const [schema, setSchema] = useState(() => AddPositionSchema({}));

	const {
		data: detailPayroll,
		isLoading: isLoadingDetailPayroll,
		error: errorDetailPayroll,
	} = useCustomQuery({
		api: PayrollApi.show,
		queryKey: ["payroll-show", { payrollperiodid, payrollid }],
		queryParams: { payrollperiodid, payrollid },
	});

	// const {
	// 	data: organizationPermission,
	// 	isLoading: isLoadingOrganizationPermission,
	// } = useCustomQuery({
	// 	api: OrganizationApi.getPermission,
	// 	queryKey: "organizationPermission",
	// });

	// useEffect(() => {
	// 	if (!isLoadingOrganizationPermission) {
	// 		setSchema(
	// 			AddPositionSchema(
	// 				organizationPermission.data.reduce((acc, item) => {
	// 					acc[item.code] = {
	// 						value: false,
	// 						name: item.name,
	// 						group: item.moduleName,
	// 					};
	// 					return acc;
	// 				}, {}),
	// 			),
	// 		);
	// 	}
	// }, [isLoadingOrganizationPermission]);

	const { onSubmit: onSubmitEditPayroll, isLoading: isLoadingEditPayroll } =
		useCustomMutation({
			api: PayrollApi.update,
			invalidateQueries: ["payroll", ["payroll", { payrollid }]],
			onError: (res) => {
				toast.error(res.message);
			},
			onSuccess: (res) => {
				toast.success(res.message);
				navigate("/master/position");
			},
		});

	const handleSubmit = async (data, e) => {
		const payload = {
		};

		onSubmitEditPayroll(payload, e);
	};

	if (isLoadingDetailPayroll) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	// if (errorDetailPosition) {
	// 	return <NotFound message="Position not found" />;
	// }

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
							employee_id:null,
							payroll_period_id:payrollperiodid,
							salary:5000000,
							bonus:0,
							deduction:0,
							net_pay:0,
							status:'okay',
						}
						}
						// schema={schema}
						className="flex flex-col gap-3"
					>
						<InputControl label={'Name'} name={'employee_id'} />
						{/* <InputControl label={'Payroll Period'} name={'payroll_period_id'}/> */}
						<InputControl label={'Salary'} name={'salary'}/>
						<InputControl label={'Bonus'} name={'bonus'}/>
						<InputControl label={'Deduction'} name={'deduction' }/>
						<InputControl label={'THP' } name={'net_pay' }/>
						<InputControl label={'Status' } name={'status' }/>
						

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
