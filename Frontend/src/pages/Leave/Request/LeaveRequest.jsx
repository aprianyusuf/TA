import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowLeft, ChevronsUpDown, Plus, Info, X } from "lucide-react";

import { Link } from "react-router-dom";

import LeaveRequestApi from "@/apis/v1/LeaveApi/LeaveRequestApi";
import {
	DeleteRow,
	Table,
	TableCell,
	TableHeader,
} from "@/components/organisms/Table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/Popover";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/Command";
import {
	CALENDAR_VIEW,
} from "@/configs/constant";
import {
	add,
	isWeekend as dateFnsIsWeekend,
	format,
	isBefore,
	isEqual,
	parse,
} from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from "@/components/ui/Dialog";
import { useBoundLocalStore, useBoundStore } from "@/stores";
import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useDataTable } from "@/hooks/useDataTable";
import { getPaginationPage, isUserCan } from "@/services/helper";
import CheckAuthorization from "@/templates/CheckAuthorization";
import ModalRequest from "./partials/ModalAddRequest";
import DetailRequest from "./partials/ModalDetailRequest";

const columnHelper = createColumnHelper();

const LeaveRequest = () => {
	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: LeaveRequestApi.getLeaveRequest,
		queryKey: "leave-request",
	});

    const userPosition = useBoundStore((state)=>state.user?.position?.name ?? '');

    const columns = useMemo(
        () => [
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
                columnHelper.accessor("user.name", {
                    header: <TableHeader>Name</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
                }),
                columnHelper.accessor("leaveType.name", {
                    header: <TableHeader>Request Type</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => (
                        <TableCell className="w-44 truncate" title={getValue()}>
                            {getValue()}
                        </TableCell>
                    ),
                }),
                columnHelper.accessor("startDate", {
                    header: <TableHeader>Start</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => {
                        const rawDate = getValue();
                        const formattedDate = rawDate ? format(new Date(rawDate), "dd-MM-yyyy") : "-";
                        return <TableCell>{formattedDate}</TableCell>;
                    },
                }),
                columnHelper.accessor("endDate", {
                    header: <TableHeader>End</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => {
                        const rawDate = getValue();
                        const formattedDate = rawDate ? format(new Date(rawDate), "dd-MM-yyyy") : "-";
                        return <TableCell>{formattedDate}</TableCell>;
                    },
                }),
                columnHelper.accessor("status", {
                    header: <TableHeader>Status</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => {
                      const status = getValue();
                  
                      let text = "";
                      let bgColor = "";
                  
                      switch (status) {
                        case 1:
                          text = "Waiting";
                          bgColor = "bg-gray-400";
                          break;
                        case 2:
                          text = "Approve";
                          bgColor = "bg-green-500";
                          break;
                        case 3:
                          text = "Reject";
                          bgColor = "bg-red-500";
                          break;
                        case 4:
                          text = "Abort";
                          bgColor = "bg-orange-500";
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
                    header: <TableHeader className={"text-center"}>Action</TableHeader>,
                    cell: ({ row: { original } }) => (
                        <TableCell className="flex justify-center gap-2">
                            {["HR", "CEO"].includes(userPosition) ? (
                                <Button className="p-2" 
                                    onClick={() =>
                                        setDetailState((prev) => ({
                                            ...prev,
                                            isOpen: true,
                                            type: 0,
                                            state: {},
                                            data:original,
                                        }))
                                    }
                                >
                                    <Info size={16}/>
                                </Button>
                            ) : (
                                <Button className="bg-red-500 p-2" title="Abort">
                                    <X size={16}/>
                                </Button>
                            )}
                        </TableCell>
                    ),
                }),
            ],
        [],
    );

    const calendarRef = useRef();
    const [isCalendarViewOpen, setCalendarViewOpen] = useState(false);
    const [selectedDateRangeText, setSelectedDateRangeText] = useState("");
	const selectedAs = useBoundLocalStore((state) => state.selectedAs);
    const [view, setView] = useState(
        CALENDAR_VIEW.find((i) => i.value === "week"),
    );

    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: 0, // 0 form create, 1 form edit, 2 form preview, 3 form approval, 4 view more
        state: null,
        event: null,
        fromMoreEvent: false,
        date: null,
    });

    const [detailState, setDetailState] = useState({
        isOpen: false,
        type: 0, // 0 form create, 1 form edit, 2 form preview, 3 form approval, 4 view more
        state: null,
        event: null,
        fromMoreEvent: false,
        date: null,
    });

    const getCalInstance = useCallback(
        () => calendarRef.current?.getInstance?.(),
        [],
    );

    const updateRenderRangeText = useCallback(() => {
        const calInstance = getCalInstance();
        if (!calInstance) {
            setSelectedDateRangeText("");
            return;
        }

        const viewName = calInstance.getViewName();
        const calDate = calInstance.getDate();

        let year = calDate.getFullYear();
        let month = calDate.getMonth() + 1;
        let date = calDate.getDate();
        let dateRangeText;

        switch (viewName) {
            case "month": {
                dateRangeText = format(
                    parse(`${date}-${month}-${year}`, "dd-MM-yyyy", new Date()),
                    "MMMM yyyy",
                );
                break;
            }
            case "week": {
                const rangeStart = calInstance.getDateRangeStart();
                const rangeEnd = calInstance.getDateRangeEnd();
                const [_, __] = [view.value, view.isWorkWeek];

                year = rangeStart.getFullYear();
                month = rangeStart.getMonth() + 1;
                date = rangeStart.getDate();
                const endYear = rangeEnd.getFullYear();
                const endMonth = rangeEnd.getMonth() + 1;
                const endDate = rangeEnd.getDate();

                const start = format(
                    parse(
                        `${year}-${month.toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`,
                        "dd-MM-yyyy",
                        new Date(),
                    ),
                    "dd MMM yyyy",
                );
                const end = format(
                    parse(
                        `${endYear}-${endMonth.toString().padStart(2, "0")}-${endDate.toString().padStart(2, "0")}`,
                        "dd-MM-yyyy",
                        new Date(),
                    ),
                    "dd MMM yyyy",
                );
                dateRangeText = `${start} to ${end}`;
                break;
            }
            default:
                dateRangeText = format(
                    parse(`${date}-${month}-${year}`, "dd-MM-yyyy", new Date()),
                    "cccc, dd MMMM yyyy",
                );
            }
    
            setSelectedDateRangeText(dateRangeText);
    }, [getCalInstance, view.isWorkWeek, view.value]);

    useEffect(() => {
        updateRenderRangeText();
        console.log(userPosition);
    }, [view.isWorkWeek, view.value, updateRenderRangeText, getCalInstance]);

    const handleFormOpen = (updateState) => {
		setDialogState((state) => ({
			...state,
			...updateState,
		}));
	};

    const handleDetailOpen = (updateState) => {
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

    const handleDetail = (open) => () => {
		setDetailState((state) => ({
			...state,
			isOpen: open,
		}));
	};

    const handleNavigation = (action) => {
		getCalInstance?.()[action]();
		updateRenderRangeText();
	};
    
	return (
		<>
			<Tabs defaultValue="table" className="flex h-full w-full flex-col">
				<TabsContent value="table">
                    <div className="flex items-center justify-between">
					    <h2 className="text-xl font-bold ml-5">Leave Request</h2>
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
                                Add Request
                            </Button>
                        </div>
                    </div>
					<Table
						columns={columns}
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
								<DialogTitle>Leave Request</DialogTitle>
							</DialogHeader>
                            <ModalRequest
                                handleFormOpen={handleFormOpen}
                                state={dialogState}
                            />
						</DialogContent>
					</DialogOverlay>
				</DialogPortal>
			</Dialog>
            <Dialog
				open={detailState.isOpen}
				onOpenChange={(open) => handleDetail(open)()}
			>
				<DialogPortal>
					<DialogOverlay>
						<DialogContent
							className={
								"custom-scrollbar !flex h-fit max-h-full min-h-full min-w-full flex-col overflow-y-auto md:max-h-[calc(100%-10%)] md:min-h-[calc(100%-90%)] md:min-w-[40rem] md:max-w-[40rem] lg:min-w-[50rem] lg:max-w-[50rem]"
							}
						>
							<DialogHeader className={"items center flex-row gap-1"}>
								<DialogTitle>Leave Request</DialogTitle>
							</DialogHeader>
                            <DetailRequest
                                handleFormOpen={handleDetailOpen}
                                state={detailState}
                            />
						</DialogContent>
					</DialogOverlay>
				</DialogPortal>
			</Dialog>
		</>
	);
};

export default CheckAuthorization({
	Component: LeaveRequest,
	menu: "MD00001",
});
