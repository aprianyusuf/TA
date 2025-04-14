import React, { useEffect, useState } from "react";

import { Enabled, PageFitMode } from "basicprimitives";
import { OrgDiagram } from "basicprimitivesreact";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import { Spinner } from "@/components/atoms/Spinner";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { useCustomQuery } from "@/hooks/useCustomQuery";

const OrganizationDiagram = () => {
	const [orgConfig, setOrgConfig] = useState({
		pageFitMode: PageFitMode.None,
		autoSizeMinimum: { width: 100, height: 100 },
		cursorItem: 0,
		highlightItem: 0,
		hasSelectorCheckbox: Enabled.False,
		templates: [
			{
				name: "template",
				itemSize: { width: 250, height: 150 },
				minimizedItemSize: { width: 3, height: 3 },
				highlightPadding: { left: 2, top: 2, right: 2, bottom: 2 },
				onItemRender: ({ context: itemConfig }) => {
					return (
						<div className="flex h-[inherit] flex-col p-1">
							<div className="rounded-md bg-primary">
								<div className="px-4 py-1 text-center text-white">
									{itemConfig.position}
								</div>
							</div>
							<div className="mt-2 flex w-full flex-grow gap-2">
								<Avatar className="size-12 rounded-lg">
									<AvatarFallback className="rounded-lg">
										{itemConfig?.firstName?.[0]?.concat(
											itemConfig?.lastName?.[0],
										)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-1 overflow-hidden">
									<span className="text-pretty font-bold">
										{itemConfig.firstName} {itemConfig.lastName}
									</span>
									<span className="truncate text-sm" title={itemConfig.email}>
										{itemConfig.email}
									</span>
								</div>
							</div>
						</div>
					);
				},
			},
		],
		items: [],
	});

	const { data, isLoading } = useCustomQuery({
		api: EmployeeApi.hierarchy,
		queryKey: "employeeHierarchy",
	});

	useEffect(() => {
		if (!isLoading) {
			setOrgConfig((c) => ({
				...c,
				items: data?.data?.map((a) => ({
					...a,
					parent: a.reportToId,
					templateName: "template",
				})),
			}));
		}
	}, [isLoading]);

	if (isLoading)
		return (
			<div className="flex w-full items-center justify-center">
				<Spinner />
			</div>
		);

	return (
		<div className="flex w-full justify-center">
			<OrgDiagram centerOnCursor={true} config={orgConfig} />
		</div>
	);
};

export default OrganizationDiagram;
