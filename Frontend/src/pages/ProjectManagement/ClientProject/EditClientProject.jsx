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
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddClientSchema } from "@/schema/request/ProjectManagement/ClientSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";
import NotFound from "@/templates/NotFound";

import {
	ProjectDateControl,
	ProjectManagerControl,
	ProjectTimesheetConfiguration,
} from "./partials/FormClientProjectControl";

const EditClientProject = () => {
	const { client, id } = useParams();
	const navigate = useNavigate();

	const {
		data: detailProject,
		isLoading: isLoadingDetailProject,
		error: errorDetailClient,
	} = useCustomQuery({
		api: ClientApi.showClientProject,
		queryKey: ["clientProject", { id, client }],
		queryParams: { id, client },
	});

	const { onSubmit: onSubmitUpdateProject, isLoading: isLoadingUpdateProject } =
		useCustomMutation({
			api: ClientApi.updateClientProject,
			invalidateQueries: [
				["clientProjects", { client }],
				["clientProject", { id, client }],
				["clientProjectUsers", { client, id }],
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
		onSubmitUpdateProject(data, e);
	};

	if (isLoadingDetailProject) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (errorDetailClient) {
		return <NotFound message="Client not found" />;
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Update Client</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							id,
							client,
							name: detailProject.data.name,
							start_date: detailProject.data.startDateAt,
							end_date: detailProject.data.endDateAt,
							cut_off_timesheet_start_day:
								detailProject.data.cutOffTimesheetStartDay,
							cut_off_timesheet_end_day:
								detailProject.data.cutOffTimesheetEndDay,
							project_manager_id: detailProject.data.projectManagerId,
							project_manager: detailProject.data.projectManager,
							color: detailProject.data.color,
							is_requires_project_manager_approval:
								detailProject.data.isRequiresProjectManagerApproval,
						}}
						schema={AddClientSchema}
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
							/>
							<InputControl
								label="Cut Off Timesheet End Day"
								name="cut_off_timesheet_end_day"
								type="number"
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
							<Button disabled={isLoadingUpdateProject} className="w-40">
								{isLoadingUpdateProject ? <Spinner /> : "Update Project"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: EditClientProject,
	menu: "MD00014",
});
