import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Kanban, Plus, User } from "lucide-react";
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
import { RESPONSE_CODE } from "@/configs/constant";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { useDataTable } from "@/hooks/useDataTable";
import { getPaginationPage, isUserCan } from "@/services/helper";
import CheckAuthorization from "@/templates/CheckAuthorization";
import NotFound from "@/templates/NotFound";

const columnHelper = createColumnHelper();

const ClientProject = () => {
	const { client } = useParams();

	const {
		data: detailClient,
		isLoading: isLoadingDetailClient,
		error: errorDetailClient,
	} = useCustomQuery({
		api: ClientApi.show,
		queryKey: ["client", { id: client }],
		queryParams: { id: client },
	});

	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: ClientApi.getClientProjectAll,
		queryKey: "clientProjects",
		queryParams: { client },
		enabled: !!detailClient,
	});

	const columns = useMemo(
		() =>
			({ isCanEdit = false, isCanDelete = false }) => [
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
				columnHelper.accessor("name", {
					header: <TableHeader>Name</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("projectManager", {
					header: <TableHeader>Project Manager</TableHeader>,
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
				columnHelper.accessor("cutOffTimesheetStartDay", {
					header: (
						<TableHeader className={"text-center"}>
							Cut Off Timesheet
						</TableHeader>
					),
					width: "w-44",
					cell: ({ row: { original } }) => (
						<TableCell className="text-center">
							{original.cutOffTimesheetStartDay} -{" "}
							{original.cutOffTimesheetEndDay}
						</TableCell>
					),
				}),
				columnHelper.accessor("createdBy", {
					header: <TableHeader>Created By</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("action", {
					isVisible: isCanEdit || isCanDelete,
					header: <TableHeader className={"text-center"}>Action</TableHeader>,
					cell: ({ row: { original } }) => (
						<TableCell className="flex justify-center gap-2">
							<Button
								asChild
								className="bg-blue-500 p-2"
								variant="link"
								title="List User"
							>
								<Link to={`${original.id}/users`}>
									<User className="size-4 text-white" />
								</Link>
							</Button>
							{isCanEdit ? (
								<Button asChild className="bg-yellow-400 p-2" variant="link">
									<Link to={`edit/${original.id}`}>
										<Edit className="size-4 text-white" />
									</Link>
								</Button>
							) : null}
							{isCanDelete ? (
								<DeleteRow
									api={ClientApi.deleteClientProject}
									invalidateQueries={[
										["clientProjects", { client }],
										["clientProject", { id: original.id, client }],
										["clients"],
										["userSidebarProject"],
									]}
									payload={{ id: original.id, client }}
								/>
							) : null}
						</TableCell>
					),
				}),
			],
		[],
	);

	if (errorDetailClient?.code === RESPONSE_CODE.NOT_FOUND) {
		return <NotFound message={errorDetailClient.message} />;
	}

	return (
		<>
			{isUserCan("MD00013") ? (
				<div className="mb-4 flex justify-end">
					<Button asChild title="Add Project">
						<Link to={"add"}>
							<Plus size={16} className="mr-2" />
							Add Project
						</Link>
					</Button>
				</div>
			) : null}
			{!isLoadingDetailClient ? (
				<span>{detailClient.data.name}</span>
			) : (
				<Skeleton className={"h-6 w-44"} />
			)}
			<Table
				columns={columns({
					isCanEdit: isUserCan("MD00014"),
					isCanDelete: isUserCan("MD00015"),
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

export default CheckAuthorization({
	Component: ClientProject,
	menu: "MD00011",
});
