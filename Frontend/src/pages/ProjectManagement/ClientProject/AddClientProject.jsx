import React from "react";

import { format } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import ClientApi from "@/apis/v1/ProjectManagementApi/ClientApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddClientProjectSchema } from "@/schema/request/ProjectManagement/ClientSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";

import {
	ProjectDateControl,
	ProjectManagerControl,
	ProjectTimesheetConfiguration,
} from "./partials/FormClientProjectControl";

const AddClientProject = () => {
	const { client } = useParams();
	const navigate = useNavigate();

	const {
		onSubmit: onSubmitAddClientProject,
		isLoading: isLoadingAddClientProject,
	} = useCustomMutation({
		api: ClientApi.createClientProject,
		invalidateQueries: [
			["clientProjects", { client }],
			["clients"],
			["userSidebarProject"],
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
		data.start_date = format(data.start_date, "yyyy-MM-dd");
		data.end_date = format(data.end_date, "yyyy-MM-dd");
		onSubmitAddClientProject(data, e);
	};

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Add Project</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							client,
							name: "",
							start_date: null,
							end_date: null,
							cut_off_timesheet_start_day: null,
							cut_off_timesheet_end_day: null,
							project_manager_id: null,
							color: "#000000",
							is_requires_project_manager_approval: true,
						}}
						schema={AddClientProjectSchema}
						className="flex flex-col gap-3"
					>
						<div className="flex flex-col gap-2 md:flex-row">
							<InputControl label="Project Name" name="name" />
							<ProjectManagerControl />
						</div>

						<ProjectDateControl />

						<div className="flex flex-col gap-2 md:flex-row">
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
						<InputControl
							label="Project Color"
							name="color"
							type="color"
							className={"w-1/2"}
						/>

						<ProjectTimesheetConfiguration />

						<div className="flex justify-end">
							<Button disabled={isLoadingAddClientProject} className="w-40">
								{isLoadingAddClientProject ? <Spinner /> : "Add Project"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: AddClientProject,
	menu: "MD00013",
});
