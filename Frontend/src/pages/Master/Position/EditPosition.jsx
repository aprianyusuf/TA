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

import PositionPermission from "./partials/PositionPermission";
import PositionSuperiorControl from "./partials/PositionSuperiorControl";

const EditPosition = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [schema, setSchema] = useState(() => AddPositionSchema({}));

	const {
		data: detailPosition,
		isLoading: isLoadingDetailPosition,
		error: errorDetailPosition,
	} = useCustomQuery({
		api: PositionApi.show,
		queryKey: ["position", { id }],
		queryParams: { id },
	});

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

	const { onSubmit: onSubmitEditPosition, isLoading: isLoadingEditPosition } =
		useCustomMutation({
			api: PositionApi.update,
			invalidateQueries: ["positions", ["position", { id }]],
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
			id,
			name: data.name,
			position_id: data.position_id,
			permissions: Object.entries(data.permissions)
				.filter(([_, obj]) => obj.value === true)
				.map(([key]) => key),
		};

		onSubmitEditPosition(payload, e);
	};

	if (isLoadingOrganizationPermission || isLoadingDetailPosition) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (errorDetailPosition) {
		return <NotFound message="Position not found" />;
	}

	return (
		<>
			<Card className="p-2">
				<CardHeader className="p-6">
					<CardTitle>Edit Position</CardTitle>
				</CardHeader>
				<CardContent>
					<HookFormProvider
						onSubmit={handleSubmit}
						defaultValues={{
							name: detailPosition.data.name,
							position_id: detailPosition.data.parent,
							permissions: organizationPermission.data.reduce((acc, item) => {
								acc[item.code] = {
									value: detailPosition.data.permissions.includes(item.code),
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
						<PositionSuperiorControl id={id} />
						<PositionPermission
							organizationPermission={organizationPermission.data}
						/>
						<div className="flex justify-end">
							<Button disabled={isLoadingEditPosition} className="w-40">
								{isLoadingEditPosition ? <Spinner /> : "Update Position"}
							</Button>
						</div>
					</HookFormProvider>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckAuthorization({
	Component: EditPosition,
	menu: "MD00009",
});
