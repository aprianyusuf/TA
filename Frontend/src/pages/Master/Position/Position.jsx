import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import PositionApi from "@/apis/v1/MasterApi/PositionApi";
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

const columnHelper = createColumnHelper();

const Position = () => {
	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: PositionApi.getAll,
		queryKey: "positions",
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
				columnHelper.accessor("parentName", {
					header: <TableHeader>Superior</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("userCount", {
					header: <TableHeader className={"text-center"}>Employee</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => (
						<TableCell className="text-center">{getValue() ?? 0}</TableCell>
					),
				}),
				columnHelper.accessor("action", {
					isVisible: isCanEdit || isCanDelete,
					header: <TableHeader className={"text-center"}>Action</TableHeader>,
					cell: ({ row: { original } }) => (
						<TableCell className="flex justify-center gap-2">
							{isCanEdit ? (
								<Button asChild className="bg-yellow-400 p-2" variant="link">
									<Link to={`edit/${original.id}`}>
										<Edit className="size-4 text-white" />
									</Link>
								</Button>
							) : null}
							{isCanDelete ? (
								<DeleteRow
									api={PositionApi.delete}
									invalidateQueries={[
										"positions",
										["position", { id: original.id }],
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
			{isUserCan("MD00008") ? (
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-xl font-bold ml-5">Position Management</h2>
					<Button asChild title="Add Position">
						<Link to={"add"}>
							<Plus size={16} className="mr-2" />
							Add Position
						</Link>
					</Button>
				</div>
			) : null}
			<Table
				columns={columns({
					isCanEdit: isUserCan("MD00009"),
					isCanDelete: isUserCan("MD00010"),
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
	Component: Position,
	menu: "MD00007",
});
