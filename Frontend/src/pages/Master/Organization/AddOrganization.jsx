import React from "react";

import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import OrganizationApi from "@/apis/v1/MasterApi/OrganizationApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import InputTextAreaControl from "@/components/moleculs/Control/InputTextAreaControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { getTimeZones } from "@/configs/constant";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddOrganizationSchema } from "@/schema/request/Foundation/OrganizationRequestSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";

import WorkHour from "./partials/WorkHour";

const AddOrganization = () => {
	const navigate = useNavigate();

	const {
		onSubmit: onSubmitAddOrganization,
		isLoading: isLoadingAddOrganization,
	} = useCustomMutation({
		api: OrganizationApi.create,
		invalidateQueries: ["organizations"],
		onError: (res) => {
			toast.error(res.message);
		},
		onSuccess: (res) => {
			toast.success(res.message);
			navigate(-1);
		},
	});

	const handleSubmit = async (data, e) => {
		onSubmitAddOrganization(data, e);
	};

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Add Organization</CardTitle>
					<CardDescription className="my-3">
						Create new organization for HRIS
					</CardDescription>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							name: "",
							domain: "",
							address: "",
							cut_off_timesheet_start_day: null,
							cut_off_timesheet_end_day: null,
							work_start_at: "08:00",
							work_end_at: "17:00",
							timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						}}
						schema={AddOrganizationSchema}
						className="flex flex-col gap-3"
					>
						<InputControl label="Organization Name" name="name" />
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
							<Button disabled={isLoadingAddOrganization} className="w-40">
								{isLoadingAddOrganization ? <Spinner /> : "Add Organization"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: AddOrganization,
	menu: "SYS00003",
});
