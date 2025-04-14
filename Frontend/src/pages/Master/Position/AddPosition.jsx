import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import OrganizationApi from "@/apis/v1/MasterApi/OrganizationApi";
import PositionApi from "@/apis/v1/MasterApi/PositionApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddPositionSchema } from "@/schema/request/Foundation/PositionRequestSchema";
import CheckAuthorization from "@/templates/CheckAuthorization";

import PositionPermission from "./partials/PositionPermission";
import PositionSuperiorControl from "./partials/PositionSuperiorControl";

const AddPosition = () => {
	const navigate = useNavigate();
	const [schema, setSchema] = useState(() => AddPositionSchema({}));

	const {
		data: organizationPermission,
		isLoading: isLoadingOrganizationPermission,
	} = useCustomQuery({
		api: OrganizationApi.getPermission,
		queryKey: "organizationPermission",
	});

	useEffect(() => {
		if (!isLoadingOrganizationPermission) {
			setSchema(
				AddPositionSchema(
					organizationPermission.data.reduce((acc, item) => {
						acc[item.code] = {
							value: false,
							name: item.name,
							group: item.moduleName,
						};
						return acc;
					}, {}),
				),
			);
		}
	}, [isLoadingOrganizationPermission]);

	const { onSubmit: onSubmitAddPosition, isLoading: isLoadingAddPosition } =
		useCustomMutation({
			api: PositionApi.create,
			invalidateQueries: ["positions"],
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
			name: data.name,
			position_id: data.position_id,
			permissions: Object.entries(data.permissions)
				.filter(([_, obj]) => obj.value === true)
				.map(([key]) => key),
		};

		onSubmitAddPosition(payload, e);
	};

	if (isLoadingOrganizationPermission) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Add Position</CardTitle>
					<CardDescription className="my-3">
						Create new Position
					</CardDescription>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							name: null,
							position_id: null,
							permissions: organizationPermission.data.reduce((acc, item) => {
								acc[item.code] = {
									value: false,
									name: item.name,
									group: item.moduleName,
								};
								return acc;
							}, {}),
						}}
						schema={schema}
						className="flex flex-col gap-3"
					>
						<InputControl label="Position Name" name="name" />
						<PositionSuperiorControl />
						<PositionPermission
							organizationPermission={organizationPermission.data}
						/>
						<div className="flex justify-end">
							<Button disabled={isLoadingAddPosition} className="w-40">
								{isLoadingAddPosition ? <Spinner /> : "Add Position"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: AddPosition,
	menu: "MD00008",
});
