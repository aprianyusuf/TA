import React from "react";

import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import ClientApi from "@/apis/v1/ProjectManagementApi/ClientApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddClientSchema } from "@/schema/request/ProjectManagement/ClientSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";

const AddClient = () => {
	const navigate = useNavigate();

	const { onSubmit: onSubmitAddClient, isLoading: isLoadingAddClient } =
		useCustomMutation({
			api: ClientApi.create,
			invalidateQueries: ["clients"],
			onError: (res) => {
				toast.error(res.message);
			},
			onSuccess: (res) => {
				toast.success(res.message);
				navigate(-1);
			},
		});

	const handleSubmit = async (data, e) => {
		onSubmitAddClient(data, e);
	};

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Add Client</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							name: "",
						}}
						schema={AddClientSchema}
						className="flex flex-col gap-3"
					>
						<InputControl label="Client Name" name="name" />

						<div className="flex justify-end">
							<Button disabled={isLoadingAddClient} className="w-40">
								{isLoadingAddClient ? <Spinner /> : "Add Client"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: AddClient,
	menu: "MD00013",
});
