import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Plus, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ClientApi from "@/apis/v1/ProjectManagementApi/ClientApi";
import {
	DeleteRow,
	Table,
	TableCell,
	TableHeader,
} from "@/components/organisms/Table";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { useDataTable } from "@/hooks/useDataTable";
import { getPaginationPage, isUserCan } from "@/services/helper";
import { useBoundStore } from "@/stores";
import NotFound from "@/templates/NotFound";

const columnHelper = createColumnHelper();

const ClientProjectUser = () => {
	const { client, id } = useParams();

	const { user } = useBoundStore((s) => s);

	const {
		data: detailClient,
		isLoading: isLoadingDetailClient,
		error: errorDetailClient,
	} = useCustomQuery({
		api: ClientApi.show,
		queryKey: ["client", { id: client }],
		queryParams: { id: client },
	});

	const {
		data: detailClientProject,
		isLoading: isLoadingDetailClientProject,
		error: errorDetailClientProject,
	} = useCustomQuery({
		api: ClientApi.showClientProject,
		queryKey: ["clientProject", { client, id }],
		queryParams: { client, id },
		enabled: !!detailClient,
	});

	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: ClientApi.getClientProjectUserAll,
		queryKey: "clientProjectUsers",
		queryParams: { client, id },
		enabled: !!detailClientProject,
	});

	const columns = useMemo(
		() =>
			({ isCanEdit = false, isCanDelete = false, projectManager }) => [
				columnHelper.accessor("no", {
					header: <TableHeader className={"text-center"}>No</TableHeader>,
					width: "w-4",
					cell: ({ row, table: { getState } }) => (
						<TableCell className="text-center">
							{row.index +
								1 +
								getState().state.pageIndex * getState().state.pageSize}
						</TableCell>
					),
				}),
				columnHelper.accessor("userFullName", {
					header: <TableHeader>Name</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("startDateAt", {
					header: (
						<TableHeader className={"text-center"}>Start Date</TableHeader>
					),
					width: "w-32",
					cell: ({ getValue }) => (
						<TableCell className="text-center">
							{format(getValue(), "dd MMM yyyy")}
						</TableCell>
					),
				}),
				columnHelper.accessor("endDateAt", {
					header: <TableHeader className={"text-center"}>End Date</TableHeader>,
					width: "w-32",
					cell: ({ getValue }) => (
						<TableCell className="text-center">
							{format(getValue(), "dd MMM yyyy")}
						</TableCell>
					),
				}),
				columnHelper.accessor("action", {
					isVisible: isCanEdit || isCanDelete,
					header: <TableHeader className={"text-center"}>Action</TableHeader>,
					cell: ({ row: { original } }) => (
						<TableCell className="flex justify-center gap-2">
							{isCanEdit && projectManager !== original.userId ? (
								<Button asChild className="bg-yellow-400 p-2" variant="link">
									<Link to={`edit/${original.userId}`}>
										<Edit className="size-4 text-white" />
									</Link>
								</Button>
							) : null}
							{isCanDelete && projectManager !== original.userId ? (
								<DeleteRow
									api={ClientApi.deleteClientProjectUser}
									invalidateQueries={[
										["clientProjectUsers", { client, id }],
										[
											"clientProjectUser",
											{
												client,
												project: original.clientProjectId,
												id: original.userId,
											},
										],
										["clientProjects", { client }],
										["clientProject", { id: original.id, client }],
									]}
									payload={{
										id: original.userId,
										client,
										project: original.clientProjectId,
									}}
								/>
							) : null}
						</TableCell>
					),
				}),
			],
		[],
	);

	if (errorDetailClient || errorDetailClientProject) {
		return (
			<NotFound
				message={
					errorDetailClient?.message || errorDetailClientProject?.message
				}
			/>
		);
	}

	return (
		<>
			{isLoadingDetailClient || isLoadingDetailClientProject ? null : [
					detailClientProject.data.projectManagerId,
					detailClientProject.data.createdById,
			  ].includes(user.id) ? (
				<div className="mb-4 flex justify-end">
					<Button asChild title="Add Project">
						<Link to={"add"}>
							<Plus size={16} className="mr-2" />
							Add User
						</Link>
					</Button>
				</div>
			) : null}
			{!isLoadingDetailClientProject && !isLoadingDetailClient ? (
				<span>
					{detailClient.data.name} {detailClientProject.data.name}
				</span>
			) : (
				<Skeleton className={"h-6 w-44"} />
			)}
			<Table
				columns={columns({
					isCanEdit: isUserCan("MD00014"),
					isCanDelete: isUserCan("MD00015"),
					projectManager: detailClientProject?.data?.projectManagerId,
				})}
				data={data?.data}
				isLoading={isLoading}
				setPagination={setPagination}
				state={pagination}
				pageCount={getPaginationPage(data?.count, pagination.pageSize)}
				total={data?.count}
			/>
		</>
	);
};

export default ClientProjectUser;
