import React, { useMemo, useState } from "react";

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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from "@/components/ui/Dialog";
import {
	add,
	isWeekend as dateFnsIsWeekend,
	format,
	isBefore,
	isEqual,
	parse,
} from "date-fns";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useDataTable } from "@/hooks/useDataTable";
import { getPaginationPage, isUserCan } from "@/services/helper";
import CheckAuthorization from "@/templates/CheckAuthorization";
import OrganizationDiagram from "@/pages/Master/Employee/partials/OrganizationDiagram";
import PayrollPeriodApi from "@/apis/v1/PayrollApi/PayrollPeriodApi";
import ModalAddPeriod from "./partials/ModalAddPeriod";

const columnHelper = createColumnHelper();

const PayrollPeriod = () => {
    const { data, isLoading, pagination, setPagination } = useDataTable({
        api: PayrollPeriodApi.getAll,
        queryKey: "payroll-period",
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
                columnHelper.accessor("year", {
                    header: <TableHeader>Year</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
                }),
                columnHelper.accessor("month", {
                    header: <TableHeader>Month</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
                }),
                columnHelper.accessor("periodStartAt", {
                    header: <TableHeader>Start at</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => {
                        const rawDate = getValue();
                        const formattedDate = rawDate ? format(new Date(rawDate), "dd-MM-yyyy") : "-";
                        return <TableCell>{formattedDate}</TableCell>;
                    },
                }),
                columnHelper.accessor("periodEndAt", {
                    header: <TableHeader>End at</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => {
                        const rawDate = getValue();
                        const formattedDate = rawDate ? format(new Date(rawDate), "dd-MM-yyyy") : "-";
                        return <TableCell>{formattedDate}</TableCell>;
                    },
                }),
                columnHelper.accessor("payrollAt", {
                    header: <TableHeader>Payroll at</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => {
                        const rawDate = getValue();
                        const formattedDate = rawDate ? format(new Date(rawDate), "dd-MM-yyyy") : "-";
                        return <TableCell>{formattedDate}</TableCell>;
                    },
                }),
                columnHelper.accessor("action", {
                    isVisible: isCanEdit || isCanDelete,
                    header: <TableHeader className={"text-center"}>Action</TableHeader>,
                    cell: ({ row: { original } }) => (
                        <TableCell className="flex justify-center gap-2">
                            {isCanEdit ? (
                                <Button asChild className="bg-yellow-400 p-2" variant="link">
                                    <Link to={`${original.id}`}>
                                        <Edit className="size-4 text-white" />
                                    </Link>
                                </Button>
                            ) : null}
                            {isCanDelete ? (
                                <DeleteRow
                                    api={PayrollPeriodApi.delete}
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

    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: 0,
        state: null,
        event: null,
        fromMoreEvent: false,
        date: null,
    });

    const handleFormOpen = (updateState) => {
		setDialogState((state) => ({
			...state,
			...updateState,
		}));
	};

    const handleDialog = (open) => () => {
		setDialogState((state) => ({
			...state,
			isOpen: open,
		}));
	};

    return (
        <>
            <Tabs defaultValue="table" className="flex h-full w-full flex-col">
                <TabsContent value="table">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold ml-5">Payroll Management</h2>
                        <div className="flex flex-col gap-2 md:flex-row">
                            <Button
                                onClick={() =>
                                    setDialogState((prev) => ({
                                        ...prev,
                                        isOpen: true,
                                        type: 0,
                                        state: {},
                                    }))
                                }
                            >
                                <Plus size={16} className="mr-2" />
                                Add Payroll Period
                            </Button>
                        </div>
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
            <Dialog
				open={dialogState.isOpen}
				onOpenChange={(open) => handleDialog(open)()}
			>
				<DialogPortal>
					<DialogOverlay>
						<DialogContent
							className={
								"custom-scrollbar !flex h-fit max-h-full min-h-full min-w-full flex-col overflow-y-auto md:max-h-[calc(100%-10%)] md:min-h-[calc(100%-90%)] md:min-w-[40rem] md:max-w-[40rem] lg:min-w-[50rem] lg:max-w-[50rem]"
							}
						>
							<DialogHeader className={"items center flex-row gap-1"}>
								<DialogTitle>Add Payroll Period</DialogTitle>
							</DialogHeader>
                            <ModalAddPeriod
                                handleFormOpen={handleFormOpen}
                                state={dialogState}
                            />
						</DialogContent>
					</DialogOverlay>
				</DialogPortal>
			</Dialog>
        </>
    );
};

export default CheckAuthorization({
    Component: PayrollPeriod,
    menu: "MD00022",
});
