import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
// import {} from 'basicprimitives';
import { ChildrenPlacementType, Enabled, PageFitMode } from "basicprimitives";
import { OrgDiagram } from "basicprimitivesreact";
import { Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
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

import OrganizationDiagram from "./partials/OrganizationDiagram";

const columnHelper = createColumnHelper();

const Employee = () => {
	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: EmployeeApi.getAll,
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
				columnHelper.accessor("email", {
					header: <TableHeader>Email</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => (
						<TableCell className="truncate w-44" title={getValue()}>
							{getValue()}
						</TableCell>
					),
				}),
				columnHelper.accessor("position", {
					header: <TableHeader>Position</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("superior", {
					header: <TableHeader>Superior</TableHeader>,
					width: "w-44",
					cell: ({ row: { original } }) => (
						<TableCell>
							{original.superiorName}{" "}
							{original.superiorPosition
								? ` (${original.superiorPosition})`
								: "-"}
						</TableCell>
					),
				}),
				// columnHelper.accessor("createdBy", {
				// 	header: <TableHeader>Created By</TableHeader>,
				// 	width: "w-44",
				// 	cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				// }),
				columnHelper.accessor("action", {
					isVisible: isCanEdit || isCanDelete,
					header: <TableHeader className={"text-center"}>Action</TableHeader>,
					cell: ({ row: { original } }) => (
						<TableCell className="flex justify-center gap-2">
							{isCanEdit ? (
								<Button asChild className="p-2 bg-yellow-400" variant="link">
									<Link to={`edit/${original.id}`}>
										<Edit className="text-white size-4" />
									</Link>
								</Button>
							) : null}
							{isCanDelete ? (
								<DeleteRow
									api={EmployeeApi.delete}
									invalidateQueries={[
										"employees",
										["employee", { id: original.id }],
										"leave-request"
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
			<Tabs defaultValue="table" className="flex flex-col w-full h-full">
				{/* <TabsList className="w-fit">
					<TabsTrigger value="table" className="w-32">
						List
					</TabsTrigger>
					<TabsTrigger value="hierarchy" className="w-32">
						Hierarchy
					</TabsTrigger>
				</TabsList> */}
				<TabsContent value="table">
					<div className="flex items-center justify-between mb-4">
						<h2 className="ml-5 text-xl font-bold">Employee Management</h2>
						<Button asChild title="Add Employee">
							<Link to={"add"}>
								<Plus size={16} className="mr-2" />
								Add Employee
							</Link>
						</Button>
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
				<TabsContent value="hierarchy" className="flex w-full h-full">
					<OrganizationDiagram />
				</TabsContent>
			</Tabs>
		</>
	);
};

export default CheckAuthorization({
	Component: Employee,
	menu: "MD00001",
});
