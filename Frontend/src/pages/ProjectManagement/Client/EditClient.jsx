import React from "react";

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

const EditClient = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const {
		data: detailClient,
		isLoading: isLoadingDetailClient,
		error: errorDetailClient,
	} = useCustomQuery({
		api: ClientApi.show,
		queryKey: ["client", { id }],
		queryParams: { id },
	});

	const { onSubmit: onSubmitUpdateClient, isLoading: isLoadingUpdateClient } =
		useCustomMutation({
			api: ClientApi.update,
			invalidateQueries: ["clients", ["client", { id }], "clientProject"],
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
			name: data.name,
		};

		onSubmitUpdateClient(payload, e);
	};

	if (isLoadingDetailClient) {
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
							name: detailClient.data.name,
						}}
						schema={AddClientSchema}
						className="flex flex-col gap-3"
					>
						<InputControl label="Client Name" name="name" />

						<div className="flex justify-end">
							<Button disabled={isLoadingUpdateClient} className="w-40">
								{isLoadingUpdateClient ? <Spinner /> : "Update Client"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: EditClient,
	menu: "MD00014",
});
