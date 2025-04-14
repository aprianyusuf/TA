import React from "react";

import { useQueryClient } from "@tanstack/react-query";
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

const AddClientProjectUser = () => {
	const { client, id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const {
		data: detailClientProject,
		isLoading: isLoadingDetailClientProject,
		error: errorDetailClientProject,
	} = useCustomQuery({
		api: ClientApi.showClientProject,
		queryKey: ["clientProject", { client, id }],
		queryParams: { client, id },
	});

	const {
		onSubmit: onSubmitAddClientProjectUser,
		isLoading: isLoadingAddClientProjectUser,
	} = useCustomMutation({
		api: ClientApi.createClientProjectUser,
		invalidateQueries: [
			["clientProjectUsers", { client, id }],
			["clientProjects", { client }],
			["clientProject", { client, id }],
			["client", { id: client }],
		],
		onError: (res) => {
			toast.error(res.message);
		},
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: [
					"clientProjectUser",
					{ client, project: id, id: res.data.user_id.toString() },
				],
			});
			toast.success(res.message);
			navigate(-1);
		},
	});

	const handleSubmit = async (data, e) => {
		onSubmitAddClientProjectUser(
			{
				client: data.client,
				id: data.id,
				user_id: data.user_id,
				start_date: format(data.start_date, "yyyy-MM-dd"),
				end_date: format(data.end_date, "yyyy-MM-dd"),
			},
			e,
		);
	};

	if (isLoadingDetailClientProject) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if ([errorDetailClientProject?.code].includes(RESPONSE_CODE.NOT_FOUND)) {
		return <NotFound message={errorDetailClientProject?.message} />;
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Add User</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							client,
							id,
							user_id: null,
							start_date: detailClientProject.data.startDateAt,
							end_date: detailClientProject.data.endDateAt,
							project_manager_id: detailClientProject.data.projectManagerId,
							project_start_date: detailClientProject.data.startDateAt,
							project_end_date: detailClientProject.data.endDateAt,
						}}
						schema={AddClientProjectUserSchema}
						className="flex flex-col gap-3"
					>
						<div className="flex flex-col gap-2 md:flex-row">
							<ClientUserProjectControl />
						</div>

						<ProjectDateControl />

						<div className="flex justify-end">
							<Button disabled={isLoadingAddClientProjectUser} className="w-40">
								{isLoadingAddClientProjectUser ? <Spinner /> : "Add User"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default AddClientProjectUser;
