import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Kanban, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import ClientApi from "@/apis/v1/ProjectManagementApi/ClientApi";
import {
	DeleteRow,
	Table,
	TableCell,
	TableHeader,
} from "@/components/organisms/Table";
import { Button } from "@/components/ui/Button";
import { useDataTable } from "@/hooks/useDataTable";
import { getPaginationPage, isUserCan } from "@/services/helper";
import CheckAuthorization from "@/templates/CheckAuthorization";

// import DeletePosition from "./partials/DeletePosition";

const columnHelper = createColumnHelper();

const Client = () => {
	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: ClientApi.getAll,
		queryKey: "clients",
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
				columnHelper.accessor("clientProjectCount", {
					header: <TableHeader className={"text-center"}>Projects</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => (
						<TableCell className="text-center">{getValue() ?? 0}</TableCell>
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
								title="List Projects"
							>
								<Link to={`${original.id}/projects`}>
									<Kanban className="size-4 text-white" />
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
									api={ClientApi.delete}
									invalidateQueries={[
										"clients",
										["client", { id: original.id }],
									]}
									payload={{ id: original.id }}
								/>
							) : null}
						</TableCell>
					),
				}),
			],
		[],
	);

	return (
		<>
			{isUserCan("MD00013") ? (
				<div className="mb-4 flex justify-end">
					<Button asChild title="Add Client">
						<Link to={"add"}>
							<Plus size={16} className="mr-2" />
							Add Client
						</Link>
					</Button>
				</div>
			) : null}
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
	Component: Client,
	menu: "MD00011",
});
