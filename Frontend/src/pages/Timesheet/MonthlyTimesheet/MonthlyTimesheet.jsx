import React, { useCallback, useEffect, useRef, useState } from "react";

import Calendar from "@ikhbaaalll/custom-toast-ui-react-calendar";
import {
	add,
	isWeekend as dateFnsIsWeekend,
	format,
	isBefore,
	isEqual,
	parse,
} from "date-fns";
import { ArrowLeft, ChevronsUpDown, Plus } from "lucide-react";
import PropTypes from "prop-types";
import { renderToStaticMarkup } from "react-dom/server";

import MonthlyTimesheetApi from "@/apis/v1/TimesheetApi/MonthlyTimesheetApi";
import { Spinner } from "@/components/atoms/Spinner";
import { Button } from "@/components/ui/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/Command";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from "@/components/ui/Dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/Popover";
import {
	CALENDAR_VIEW,
	TIMESHEET_APPROVAL_STATUS,
	TIMESHEET_STATUS,
} from "@/configs/constant";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { cn } from "@/libs/utils";
import {
	calculateTimeDifference,
	getTextColorFromBackground,
	getUTCOffsetInHours,
	hexToRgb,
} from "@/services/helper";
import { useBoundLocalStore } from "@/stores";

import DetailMoreEvent from "./partials/DetailMoreEvent";
import DetailTimesheet from "./partials/DetailTimesheet";
import FormViewTimesheetAs from "./partials/FormViewTimesheetAs";

import "@ikhbaaalll/custom-toast-ui-calendar/dist/custom-toastui-calendar.min.css";

const Event = ({ event, isMySelf = false }) => {
	const from = `${format(event.raw.start, "EEEE',' dd MMMM yyyy HH:mm ")}`;
	const to =
		format(event.raw.start, "yyyy-MM-dd") ===
		format(event.raw.end, "yyyy-MM-dd")
			? format(event.raw.end, "HH:mm ")
			: format(event.raw.end, "EEEE',' dd MMMM yyyy HH:mm ");
	let backgroundColor = event.raw.projectColor;

	if (!event.raw.projectColor) {
		backgroundColor = "#273b27";
	}

	if (event.raw?.approvalStatus === TIMESHEET_APPROVAL_STATUS.PENDING) {
		backgroundColor = hexToRgb(backgroundColor, 1);
	}

	if (event.raw?.approvalStatus === TIMESHEET_APPROVAL_STATUS.WAITING) {
		backgroundColor = hexToRgb(backgroundColor, 0.8);
	}

	return (
		<span
			className={cn("flex h-full justify-between", {
				"motion-safe:animate-pulse":
					event.raw?.approvalStatus === TIMESHEET_APPROVAL_STATUS.PENDING ||
					(event.raw?.status === TIMESHEET_STATUS.REVISED && isMySelf),
			})}
			style={{
				backgroundColor,
				color: getTextColorFromBackground(backgroundColor),
			}}
			title={`${event.title} \nfrom ${from} to ${to} (${calculateTimeDifference(
				event.raw.start,
				event.raw.end,
			)})`}
		>
			<span className="flex h-fit items-center gap-1 px-1">
				<span className="font-bold">{format(event.raw.start, "HH:mm")}</span>
				{event.raw.clientProject ? (
					<span span className="font-bold">
						{" "}
						{event.raw.clientProject}:
					</span>
				) : null}
				<span title={event.title}>{event.title}</span>
			</span>
		</span>
	);
};

Event.propTypes = {
	event: PropTypes.object,
	isMySelf: PropTypes.bool,
};

const MonthlyTimesheet = () => {
	const calendarRef = useRef();
	const [isCalendarViewOpen, setCalendarViewOpen] = useState(false);
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
	const [selectedDateRangeText, setSelectedDateRangeText] = useState("");
	const [isAsLocalTime, setAsLocalTime] = useState(true);

	const selectedAs = useBoundLocalStore((state) => state.selectedAs);

	const { data, isLoading } = useCustomQuery({
		api:
			selectedAs !== "My Self"
				? MonthlyTimesheetApi.getTimesheetByUser
				: MonthlyTimesheetApi.getTimesheet,
		queryKey:
			selectedAs !== "My Self"
				? ["timesheetByUser", { id: selectedAs }]
				: ["timesheetThisMonth"],
		queryParams: selectedAs !== "My Self" ? { id: selectedAs } : null,
	});

	const { data: timesheetConfig, isLoading: isLoadingTimesheetConfig } =
		useCustomQuery({
			api: MonthlyTimesheetApi.getTimesheetConfig,
			queryKey: ["timesheetConfiguration"],
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
	}, [view.isWorkWeek, view.value, updateRenderRangeText, getCalInstance]);

	const handleFormOpen = (updateState) => {
		setDialogState((state) => ({
			...state,
			...updateState,
		}));
	};

	const handleNavigation = (action) => {
		getCalInstance?.()[action]();
		updateRenderRangeText();
	};

	const handleClickEvent = ({ event, fromMoreEvent = false }) => {
		const state = {
			title: event.raw.title,
			id: event.raw.id,
			clientProjectId: event.raw.clientProjectId,
			timezone: event.raw.timezone,
			description: event.raw.description,
			startDateAt: event.raw.start,
			startTimeAt: format(event.raw.start, "HH:mm"),
			endDateAt: event.raw.end,
			endTimeAt: format(event.raw.end, "HH:mm"),
		};

		handleFormOpen({
			isOpen: true,
			state: state,
			type: 2,
			event: event.raw,
			fromMoreEvent,
		});
	};

	const handleDialog = (open) => () => {
		setDialogState((state) => ({
			...state,
			isOpen: open,
		}));
	};

	const handleCreateOnSelectDateTime = (a) => {
		if (a.isAllday || selectedAs !== "My Self") {
			return;
		}
		const state = {
			startDateAt: a.start,
			startTimeAt: format(a.start, "HH:mm"),
			endDateAt: a.end,
			endTimeAt: format(a.end, "HH:mm"),
		};

		setDialogState((prev) => ({
			...prev,
			isOpen: true,
			state: state,
			type: 0,
		}));
	};

	const handleUpdateOnSelectEvent = ({ event, changes }) => {
		const state = {
			title: event.raw.title,
			id: event.raw.id,
			timezone: event.raw.timezone,
			description: event.raw.description,
			clientProjectId: event.raw.clientProjectId,
		};

		if (changes.start) {
			state.startDateAt = changes.start.d.d;
			state.startTimeAt = format(changes.start.d.d, "HH:mm");
		} else {
			state.startDateAt = event.raw.start;
			state.startTimeAt = format(event.raw.start, "HH:mm");
		}

		if (changes.end) {
			state.endDateAt = changes.end.d.d;
			state.endTimeAt = format(changes.end.d.d, "HH:mm");
		} else {
			state.endDateAt = event.raw.end;
			state.endTimeAt = format(event.raw.end, "HH:mm");
		}

		setDialogState({
			isOpen: true,
			state: state,
			type: 1,
			event: event.raw,
		});
	};

	const handleOpenMore = ({ date }) => {
		const eventByDate = data.data?.filter(
			(i) => format(i.start, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
		);
		handleFormOpen({
			isOpen: true,
			type: 4,
			state: eventByDate,
			date,
			fromMoreEvent: false,
		});
	};

	if (isLoading || isLoadingTimesheetConfig) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<span className="flex items-center gap-2">
				<p className="text-base font-bold md:text-lg">
					EMPLOYEE ACTIVITY REPORT & TIMESHEET
				</p>
				<FormViewTimesheetAs />
			</span>
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
					{selectedAs === "My Self" ? (
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
							Add Timesheet
						</Button>
					) : null}
					<Button
						onClick={() => setAsLocalTime((prev) => !prev)}
						className={cn("w-32", {
							"border border-primary bg-white text-primary shadow hover:bg-primary hover:text-primary-foreground":
								isAsLocalTime,
						})}
					>
						{isAsLocalTime ? "As Local Time" : "As Real Data"}
					</Button>
				</div>
			</div>
			<span>
				{selectedDateRangeText || format(new Date(), "cccc, dd MMMM yyyy")}
			</span>
			<Calendar
				ref={calendarRef}
				usageStatistics={false}
				view={view.value || "month"}
				gridSelection={{
					enableClick: false,
				}}
				month={{
					isAlways6Weeks: false,
					narrowWeekend: true,
					visibleEventCount: 0,
				}}
				week={{
					taskView: false,
					collapseDuplicateEvents: false,
					workweek: view?.isWorkWeek || false,
					timeStep: [0, 15, 30, 45],
				}}
				calendars={[{ id: "timesheet", name: "Timesheet" }]}
				template={{
					time: function (event) {
						return renderToStaticMarkup(
							<Event event={event} isMySelf={selectedAs === "My Self"} />,
						);
					},
					timegridNowIndicatorLabel: () => "",
					timegridDisplayPrimaryTime: ({ time }) =>
						`${time.getHours().toString().padStart(2, "0")}:00`,
					monthGridHeaderExceed: (events) =>
						`<span class="cursor-pointer">${events + " data"}</span>`,
					weekDayName: (e) => {
						const date = e.dateInstance.toDate();
						const isToday = isEqual(
							format(date, "yyyy-MM-dd"),
							format(new Date(), "yyyy-MM-dd"),
						);
						const isWeekend = dateFnsIsWeekend(format(date, "yyyy-MM-dd"));
						const isPassed = isBefore(
							format(date, "yyyy-MM-dd"),
							format(new Date(), "yyyy-MM-dd"),
						);
						return `
						<span class="${cn(`flex flex-col text-primary text-sm h-12 overflow-hidden`, { "text-green-700 border-t-2 md:border-t-[3px] border-t-green-700": isToday, "text-primary/40": isPassed, "text-red-600": isWeekend, "text-red-600/50": isWeekend && isPassed, "border-t-4 border-t-red-600": isToday && isWeekend })}">
							<span class="font-bold h-5 text-base md:text-lg">${format(date, "dd")}</span>
							<span class="text-xs md:text-sm h-4 text-ellipsis md:overflow-visible md:whitespace-normal md:text-clip">${format(date, "EEEE")}</span>
						</span>
						`;
					},
				}}
				events={[...data.data].map((a) => {
					let borderColor = "#000";

					if (a.status === TIMESHEET_STATUS.COMPLETED) {
						borderColor = "rgba(0,170,0,1)";
					} else if (a.status === TIMESHEET_STATUS.REJECTED) {
						borderColor = "rgba(190,0,0,1)";
					} else if (TIMESHEET_STATUS.SUBMIT === a.status) {
						borderColor = "rgba(240,200,0,1)";
					} else if (a.status === TIMESHEET_STATUS.REVISED) {
						borderColor = "rgba(251,146,60,1)";
					}

					if (a?.approvalStatus === TIMESHEET_APPROVAL_STATUS.PENDING) {
						borderColor = hexToRgb("#ff0", 0.8);
					}

					if (a?.approvalStatus === TIMESHEET_APPROVAL_STATUS.WAITING) {
						borderColor = hexToRgb("#00ff00", 0.7);
					}

					a.start = add(
						parse(a.start.replace(/T/g, " "), "yyyy-MM-dd HH:mm:ss", a.start),
						{
							hours:
								getUTCOffsetInHours(
									isAsLocalTime
										? Intl.DateTimeFormat().resolvedOptions().timeZone
										: a.timezone,
								) * -1,
						},
					);
					a.end = add(
						parse(a.end.replace(/T/g, " "), "yyyy-MM-dd HH:mm:ss", a.end),
						{
							hours:
								getUTCOffsetInHours(
									isAsLocalTime
										? Intl.DateTimeFormat().resolvedOptions().timeZone
										: a.timezone,
								) * -1,
						},
					);
					a.isReadOnly =
						![TIMESHEET_STATUS.DRAFT, TIMESHEET_STATUS.REVISED].includes(
							a.status,
						) || selectedAs !== "My Self";

					a.borderColor = borderColor;
					return {
						...a,
						raw: a,
						borderColor,
					};
				})}
				theme={{
					week: {
						weekend: {
							backgroundColor: "rgba(255,0,0,.1)",
						},
						today: {
							color: "green",
							backgroundColor: "rgba(0,255,0,.1)",
						},
						timeGridHalfHourLine: {
							borderBottom: "1px dashed rgba(0,0,0,.1)",
							backgroundColor: (time) => {
								return time.startTime >= timesheetConfig?.data?.workStartAt &&
									time.endTime <= timesheetConfig?.data?.workEndAt
									? "#fff"
									: "rgba(0,0,0,.1)";
							},
						},
						timeGridHourLine: {
							borderBottom: "1px solid rgba(0,0,0,.3)",
						},
						nowIndicatorPast: {
							border: "2px dotted rgba(255,0,0,.2)",
						},
						nowIndicatorToday: {
							border: "2px solid rgba(255,0,0,.5)",
						},
						nowIndicatorBullet: {
							backgroundColor: "rgba(255,0,0,1)",
						},
						timeGridLeft: {
							width: "40px",
						},
						timeGrid: {
							borderRight: "1px solid rgba(0,0,0,.3)",
						},
					},
					month: {
						weekend: {
							backgroundColor: "rgba(255,0,0,.1)",
						},
					},
				}}
				onClickEvent={handleClickEvent}
				onSelectDateTime={handleCreateOnSelectDateTime}
				onBeforeUpdateEvent={handleUpdateOnSelectEvent}
				// [ ]: TODO handle open more event
				onClickMoreEventsBtn={handleOpenMore}
			/>
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
								{dialogState.fromMoreEvent ? (
									<Button
										className="bg-transparent p-2"
										variant="link"
										onClick={() => handleOpenMore({ date: dialogState.date })}
									>
										<ArrowLeft />
									</Button>
								) : null}
								<DialogTitle>Timesheet</DialogTitle>
							</DialogHeader>
							{dialogState.type === 4 ? (
								<DetailMoreEvent
									data={dialogState.state}
									handleClickEvent={handleClickEvent}
								/>
							) : (
								<DetailTimesheet
									handleFormOpen={handleFormOpen}
									state={dialogState}
								/>
							)}
						</DialogContent>
					</DialogOverlay>
				</DialogPortal>
			</Dialog>
		</>
	);
};

export default MonthlyTimesheet;
