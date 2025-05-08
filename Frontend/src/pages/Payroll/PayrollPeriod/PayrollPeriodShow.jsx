import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
// import {} from 'basicprimitives';
import { ChildrenPlacementType, Enabled, PageFitMode } from "basicprimitives";
import { OrgDiagram } from "basicprimitivesreact";
import { Edit, Plus, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";

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
import { useCustomQuery } from "@/hooks/useCustomQuery";

const columnHelper = createColumnHelper();

const PayrollPeriodShow = () => {
	const { id } = useParams();

	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: PayrollApi.getPayrollsByPeriod,
		queryKey: ["payrollByPeriod", { id }],
		queryParams: { id },
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
				columnHelper.accessor("salary", {
					header: <TableHeader>Base Salary</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("status", {
					header: <TableHeader>Status</TableHeader>,
					width: "w-44",
					cell: ({ getValue }) => {
						const status = getValue();

						let text = "";
						let bgColor = "";

						switch (status) {
							case 0:
								text = "Waiting";
								bgColor = "bg-gray-400";
								break;
							case 1:
								text = "Already Paid";
								bgColor = "bg-green-500";
								break;
							default:
								text = "Unknown";
								bgColor = "bg-gray-200";
						}
						return (
							<TableCell>
								<span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${bgColor}`}>
									{text}
								</span>
							</TableCell>
						);
					},
				}),
				columnHelper.accessor("action", {
					isVisible: isCanEdit,
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
							<Button className="p-2 bg-gray-500" title="print">
								<Link to={`${original.id}`}>
									<Printer size={16} />
								</Link>
							</Button>
						</TableCell>
					),
				}),
			],
		[],
	);

	return (
		<>
			<Tabs defaultValue="table" className="flex flex-col w-full h-full">
				<TabsContent value="table">
					<div className="flex items-center justify-start mb-4">
						<h2 className="ml-5 text-xl font-bold">Payroll Management</h2>
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
	Component: PayrollPeriodShow,
	menu: "MD00023",
});
