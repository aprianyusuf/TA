import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import OrganizationApi from "@/apis/v1/MasterApi/OrganizationApi";
import {
	DeleteRow,
	Table,
	TableCell,
	TableFilter,
	TableHeader,
} from "@/components/organisms/Table";
import { Button } from "@/components/ui/Button";
import { useDataTable, useFilterTable } from "@/hooks/useDataTable";
import { OrganizationFilter } from "@/schema/request/DataTableRequest";
import { formatTime } from "@/services/formatter";
import { getPaginationPage, isUserCan } from "@/services/helper";
import CheckAuthorization from "@/templates/CheckAuthorization";

const columnHelper = createColumnHelper();

const Organization = () => {
	const {
		columnFilters,
		setColumnFilters,
		columnVisibility,
		setColumnVisibility: _,
	} = useFilterTable({
		rules: OrganizationFilter,
	});

	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: OrganizationApi.getAll,
		queryKey: "organizations",
		queryParams: {
			filters: columnFilters?.filters.filter(
				(i) => i.column && i.condition && i.value,
			),
		},
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
					id: "name",
					enableColumnFilter: true,
					enableHiding: true,
					header: <TableHeader className={"flex gap-1"}>Name</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("domain", {
					id: "domain",
					enableColumnFilter: true,
					enableHiding: true,
					header: <TableHeader>Domain</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("address", {
					enableHiding: true,
					header: <TableHeader>Address</TableHeader>,
					width: "w-56",
					cell: ({ getValue }) => (
						<TableCell className="truncate">{getValue()}</TableCell>
					),
				}),
				columnHelper.accessor("timezone", {
					enableHiding: true,
					header: <TableHeader>Timezone</TableHeader>,
					width: "w-56",
					cell: ({ getValue, row: { original } }) => (
						<TableCell className="truncate">{`${getValue()} (${formatTime(original.timezoneOffset)})`}</TableCell>
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
									api={OrganizationApi.delete}
									invalidateQueries={[
										"organizations",
										["organization", { id: original.id }],
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
			{isUserCan("SYS00003") ? (
				<div className="mb-4 flex justify-end">
					<Button asChild title="Add Organization">
						<Link to={"add"}>
							<Plus size={16} className="mr-2" />
							Add Organization
						</Link>
					</Button>
				</div>
			) : null}
			<Table
				columns={columns({
					isCanEdit: isUserCan("SYS00004"),
					isCanDelete: isUserCan("SYS00005"),
				})}
				data={data?.data}
				isLoading={isLoading}
				setPagination={setPagination}
				state={{ ...pagination, columnVisibility }}
				pageCount={getPaginationPage(data?.count, pagination.pageSize)}
				total={data?.count}
			>
				{({ columnFilter, columnVisibility: _, table }) => (
					<div className="flex gap-3">
						<TableFilter
							availableFilter={columnFilter}
							filterRules={OrganizationFilter}
							filterState={columnFilters}
							handleApplyFilter={(v) => setColumnFilters(v)}
							table={table}
						/>
					</div>
				)}
			</Table>
		</>
	);
};

export default CheckAuthorization({
	Component: Organization,
	menu: "SYS00001",
});
