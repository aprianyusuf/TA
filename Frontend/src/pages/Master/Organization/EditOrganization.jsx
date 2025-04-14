import React from "react";

import { format, parse } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import OrganizationApi from "@/apis/v1/MasterApi/OrganizationApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import InputTextAreaControl from "@/components/moleculs/Control/InputTextAreaControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getTimeZones } from "@/configs/constant";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddOrganizationSchema } from "@/schema/request/Foundation/OrganizationRequestSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";
import NotFound from "@/templates/NotFound";

import WorkHour from "./partials/WorkHour";

const EditOrganization = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const {
		data: detailOrganization,
		isLoading: isLoadingDetailOrganization,
		error: errorDetailOrganization,
	} = useCustomQuery({
		api: OrganizationApi.show,
		queryKey: ["organization", { id }],
		queryParams: { id },
	});

	const {
		onSubmit: onSubmitUpdateOrganization,
		isLoading: isLoadingUpdateOrganization,
	} = useCustomMutation({
		api: OrganizationApi.update,
		invalidateQueries: ["organizations", ["organization", { id }]],
		onError: (res) => {
			toast.error(res.message);
		},
		onSuccess: (res) => {
			toast.success(res.message);
			navigate(-1);
		},
	});

	const handleSubmit = async (data, e) => {
		const payload = {
			id,
			address: data.address,
			cut_off_timesheet_start_day: data.cut_off_timesheet_start_day,
			cut_off_timesheet_end_day: data.cut_off_timesheet_end_day,
			timezone: data.timezone,
			work_start_at: data.work_start_at,
			work_end_at: data.work_end_at,
		};

		onSubmitUpdateOrganization(payload, e);
	};

	if (isLoadingDetailOrganization) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (errorDetailOrganization) {
		return <NotFound message="Organization not found" />;
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Update Organization</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							name: detailOrganization.data.name,
							domain: detailOrganization.data.domain,
							address: detailOrganization.data.address,
							cut_off_timesheet_start_day:
								detailOrganization.data.cutOffTimesheetStartDay,
							cut_off_timesheet_end_day:
								detailOrganization.data.cutOffTimesheetEndDay,
							timezone: detailOrganization.data.timezone,
							work_start_at: format(
								parse(
									detailOrganization.data.workStartAt,
									"HH:mm:ss",
									new Date(),
								),
								"HH:mm",
							),
							work_end_at: format(
								parse(
									detailOrganization.data.workEndAt,
									"HH:mm:ss",
									new Date(),
								),
								"HH:mm",
							),
						}}
						schema={AddOrganizationSchema}
						className="flex flex-col gap-3"
					>
						<InputControl label="Organization Name" name="name" isDisabled />
						<InputControl
							label="Organization Domain"
							name="domain"
							leftAddOn={
								<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm text-muted-foreground peer-disabled:opacity-50">
									https://
								</span>
							}
							placeholder="example.com"
							className="peer pl-16"
							isDisabled
						/>
						<SelectControl
							name={"timezone"}
							label={"Timezone"}
							options={getTimeZones()}
						/>
						<div className="flex flex-col gap-2 md:flex-row">
							<div className="flex basis-1/2 flex-col gap-2 md:flex-row">
								<WorkHour />
							</div>
							<div className="flex basis-1/2 flex-col gap-2 md:flex-row">
								<InputControl
									label="Cut Off Timesheet Start Day"
									name="cut_off_timesheet_start_day"
									type="number"
									min={1}
									max={30}
								/>
								<InputControl
									label="Cut Off Timesheet End Day"
									name="cut_off_timesheet_end_day"
									type="number"
									min={1}
									max={30}
								/>
							</div>
						</div>
						<InputTextAreaControl
							name="address"
							label="Organization Address"
							placeholder="Enter address"
						/>

						<div className="flex justify-end">
							<Button disabled={isLoadingUpdateOrganization} className="w-40">
								{isLoadingUpdateOrganization ? (
									<Spinner />
								) : (
									"Update Organization"
								)}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: EditOrganization,
	menu: "SYS00004",
});
