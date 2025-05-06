import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
// import {} from 'basicprimitives';
import { ChildrenPlacementType, Enabled, PageFitMode } from "basicprimitives";
import { OrgDiagram } from "basicprimitivesreact";
import { Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import PayrollApi from "@/apis/v1/PayrollApi/PayrollApi";
import {
	DeleteRow,
	Table,
	TableCell,
	TableHeader,
} from "@/components/organisms/Table";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useDataTable } from "@/hooks/useDataTable";
import { getPaginationPage, isUserCan } from "@/services/helper";
import CheckAuthorization from "@/templates/CheckAuthorization";
import OrganizationDiagram from "@/pages/Master/Employee/partials/OrganizationDiagram";

const columnHelper = createColumnHelper();

const Employee = () => {
	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: PayrollApi.getAll,
		queryKey: "employees",
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
				columnHelper.accessor("position", {
					header: <TableHeader>Position</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("createdBy", {
					header: <TableHeader>Salary</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
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
									api={EmployeeApi.delete}
									invalidateQueries={[
										"employees",
										["employee", { id: original.id }],
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
			<Tabs defaultValue="table" className="flex h-full w-full flex-col">
				<TabsContent value="table">
					<div className="mb-4 flex justify-end">
					</div>
					<Table
						columns={columns({
							isCanEdit: isUserCan("MD00004"),
							isCanDelete: isUserCan("MD00005"),
						})}
						data={data?.data}
						isLoading={isLoading}
						setPagination={setPagination}
						state={pagination}
						pageCount={getPaginationPage(data?.count, pagination.pageSize)}
						total={data?.count}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
};

export default CheckAuthorization({
	Component: Employee,
	menu: "MD00001",
});
