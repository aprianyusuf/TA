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

    const userPosition = useBoundStore((state)=>state.user.position.name);

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
                    cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
                }),
                columnHelper.accessor("endDate", {
                    header: <TableHeader>End</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
                }),
                columnHelper.accessor("status", {
                    header: <TableHeader>Status</TableHeader>,
                    width: "w-44",
                    cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
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
                        "yyyy-MM-dd",
                        new Date(),
                    ),
                    "dd MMM yyyy",
                );
                const end = format(
                    parse(
                        `${endYear}-${endMonth.toString().padStart(2, "0")}-${endDate.toString().padStart(2, "0")}`,
                        "yyyy-MM-dd",
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
                    <div className="flex justify-between">
                        <div className="flex flex-col items-center gap-2 md:flex-row">
                            <div className="flex gap-2">
                                <Popover
                                    open={isCalendarViewOpen}
                                    onOpenChange={setCalendarViewOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isCalendarViewOpen}
                                            className="w-44 justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                {<view.Icon className="h-4 w-4 shrink-0" />}
                                                {view.label}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-44 p-0">
                                        <Command>
                                            <CommandList>
                                                <CommandGroup>
                                                    {CALENDAR_VIEW.map((calendarView) => (
                                                        <CommandItem
                                                            key={`${calendarView.value}-${(+calendarView.isWorkWeek).toString()}`}
                                                            value={`${calendarView.value}-${(+calendarView.isWorkWeek).toString()}`}
                                                            onSelect={(currentValue) => {
                                                                setView(
                                                                    CALENDAR_VIEW?.find(
                                                                        (v) =>
                                                                            `${v.value}-${(+v.isWorkWeek).toString()}` ===
                                                                            currentValue,
                                                                    ),
                                                                );
                                                                setCalendarViewOpen(false);
                                                                updateRenderRangeText();
                                                            }}
                                                        >
                                                            {
                                                                <calendarView.Icon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        `${calendarView.value}-${(+calendarView.isWorkWeek).toString()}` ===
                                                                            `${view.value}-${(+view.isWorkWeek).toString()}`
                                                                            ? "opacity-100"
                                                                            : "opacity-50",
                                                                    )}
                                                                />
                                                            }
                                                            {calendarView.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-grow gap-2">
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className={
                                        "border border-black px-2 py-4 text-black hover:bg-slate-200"
                                    }
                                    onClick={() => handleNavigation("prev")}
                                >
                                    <ArrowLeft className="size-4" />
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className={
                                        "flex-grow border border-black px-2 py-4 text-black hover:bg-slate-200 md:flex-grow-0"
                                    }
                                    onClick={() => handleNavigation("today")}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className={
                                        "border border-black px-2 py-4 text-black hover:bg-slate-200"
                                    }
                                    onClick={() => handleNavigation("next")}
                                >
                                    <ArrowLeft className="size-4 rotate-180 transform" />
                                </Button>
                            </div>
                        </div>
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
                    <span>
                        {selectedDateRangeText || format(new Date(), "cccc, dd MMMM yyyy")}
                    </span>
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
