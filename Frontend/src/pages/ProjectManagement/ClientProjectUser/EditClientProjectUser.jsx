import React from "react";

import { format } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import ClientApi from "@/apis/v1/ProjectManagementApi/ClientApi";
import { Spinner } from "@/components/atoms/Spinner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RESPONSE_CODE } from "@/configs/constant";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddClientProjectUserSchema } from "@/schema/request/ProjectManagement/ClientSchema";
import NotFound from "@/templates/NotFound";

import {
	ClientUserProjectControl,
	ProjectDateControl,
} from "./partials/FormClientProjectControl";

const EditClientProjectUser = () => {
	const { client, project, id } = useParams();
	const navigate = useNavigate();

	const {
		data: detailClientProject,
		isLoading: isLoadingDetailClientProject,
		error: errorDetailClientProject,
	} = useCustomQuery({
		api: ClientApi.showClientProject,
		queryKey: ["clientProject", { client, id: project }],
		queryParams: { client, id: project },
	});

	const {
		data: detailClientProjectUser,
		isLoading: isLoadingDetailClientProjectUser,
		error: errorDetailClientProjectUser,
	} = useCustomQuery({
		api: ClientApi.showClientProjectUser,
		queryKey: ["clientProjectUser", { client, project, id }],
		queryParams: { client, project, id },
		enabled: !!detailClientProject,
	});

	const {
		onSubmit: onSubmitEditClientProjectUser,
		isLoading: isLoadingEditClientProjectUser,
	} = useCustomMutation({
		api: ClientApi.updateClientProjectUser,
		invalidateQueries: [
			["clientProjectUser", { client, project, id }],
			["clientProjectUsers", { client, id: project }],
			["clientProjects", { client }],
			["clientProject", { client, id: project }],
			["client", { id: client }],
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
		onSubmitEditClientProjectUser(
			{
				client: data.client,
				project: data.project,
				id: data.id,
				user_id: data.user_id,
				start_date: format(data.start_date, "yyyy-MM-dd"),
				end_date: format(data.end_date, "yyyy-MM-dd"),
			},
			e,
		);
	};

	if (isLoadingDetailClientProjectUser || isLoadingDetailClientProject) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (
		[
			errorDetailClientProject?.code,
			errorDetailClientProjectUser?.code,
		].includes(RESPONSE_CODE.NOT_FOUND)
	) {
		return (
			<NotFound
				message={
					errorDetailClientProject?.message ??
					errorDetailClientProjectUser?.message
				}
			/>
		);
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Edit User</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							client,
							project,
							id,
							user_id: id,
							start_date: detailClientProjectUser.data.startDateAt,
							end_date: detailClientProjectUser.data.endDateAt,
							project_start_date: detailClientProject.data.startDateAt,
							project_end_date: detailClientProject.data.endDateAt,
						}}
						schema={AddClientProjectUserSchema}
						className="flex flex-col gap-3"
					>
						<div className="flex flex-col gap-2 md:flex-row">
							<ClientUserProjectControl
								isDisabled
								options={[
									{
										value: detailClientProjectUser.data.userId,
										label: detailClientProjectUser.data.userFullName,
									},
								]}
							/>
						</div>

						<ProjectDateControl />

						<div className="flex justify-end">
							<Button
								disabled={isLoadingEditClientProjectUser}
								className="w-40"
							>
								{isLoadingEditClientProjectUser ? <Spinner /> : "Edit User"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default EditClientProjectUser;
