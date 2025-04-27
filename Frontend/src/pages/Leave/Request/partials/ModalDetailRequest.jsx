import React, { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { add, format, isAfter, parse, sub } from "date-fns";
import { MoveRight, Pencil } from "lucide-react";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";

import ClientApi from "@/apis/v1/ProjectManagementApi/ClientApi";
import MonthlyTimesheetApi from "@/apis/v1/TimesheetApi/MonthlyTimesheetApi";
import { Spinner } from "@/components/atoms/Spinner";
import CalendarControl from "@/components/moleculs/Control/CalendarControl";
import InputControl from "@/components/moleculs/Control/InputControl";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { Button } from "@/components/ui/Button";
import { getTimeZones } from "@/configs/constant";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { TimesheetSchema } from "@/schema/request/Timesheet/FormTimesheetSchema";
import {
	calculateTimeDifferenceDays,
	getNearest30Minutes,
	getUTCOffsetInHours,
} from "@/services/helper";

import PreviewTimesheet from "@/pages/Timesheet/MonthlyTimesheet/partials/PreviewTimesheet";
import LeaveRequestApi from "@/apis/v1/LeaveApi/LeaveRequestApi";
import LeaveTypeControl from "./LeaveTypeControl";

const DateTimesheetControl = () => {
	const { watch, setValue } = useFormContext();

	const [startDateAt, startTimeAt, endDateAt, endTimeAt] = watch([
		"start_date_at",
		"start_time_at",
		"end_date_at",
		"end_time_at",
	]);

	const now = new Date();
	const earliestDate = sub(now, { months: 1 });
	const latestDate = add(now, { months: 1 });

	const parseTime = (timeStr) => {
		if (!timeStr) return null;
		try {
			return parse(timeStr, new Date());
		} catch {
			return null;
		}
	};

	const safeFormat = (date, dateFormat = "dd/MM/yyyy") => {
		try {
			return format(date, dateFormat);
		} catch {
			return "";
		}
	};

	const allTimes = Array.from({ length: 24 * 4 }).map((_, i) => {
		const hours = Math.floor(i / 4);
		const minutes = (i % 4) * 15;
		const time = new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		});
		return { label: time, value: time };
	});

	const validEndTimes = allTimes.filter((val) => {
		if (!startDateAt || !endDateAt) return true;

		const isSameDay = safeFormat(endDateAt) === safeFormat(startDateAt);
		const start = parseTime(startTimeAt);
		const current = parseTime(val.value);

		if (isSameDay && start && current) {
			return isAfter(current, start);
		}

		return true;
	});

	return (
		<div className="grid grid-cols-4 place-items-center gap-2 md:grid-cols-12">
			<CalendarControl
				name="start_date_at"
				onChangeListen={(val) => {
					if (!val) return;
					if (!endDateAt || isAfter(val, endDateAt)) {
						setValue("end_date_at", val);
					}
				}}
				calendarProps={{
					disabled: {
						before: earliestDate,
						after: latestDate,
					},
				}}
				className="col-span-3"
			/>
			<MoveRight className="hidden size-0 md:col-auto md:block md:size-5" />
			<CalendarControl
				name="end_date_at"
				onChangeListen={(val) => {
					if (!val) return;
					const start = parseTime(startTimeAt);
					const end = parseTime(endTimeAt);
					const isSameDay = safeFormat(val) === safeFormat(startDateAt);

					if (isSameDay && start && end && !isAfter(end, start)) {
						const adjusted = add(start, { minutes: 30 });
						setValue("end_time_at");
					}
				}}
				calendarProps={{
					disabled: {
						before: startDateAt || earliestDate,
						after: latestDate,
					},
				}}
				className="col-span-3"
			/>
			<span className="hidden text-center text-sm md:col-auto md:block md:w-32">
				{startDateAt &&
					endDateAt &&
					startTimeAt &&
					endTimeAt &&
					calculateTimeDifferenceDays(
						parse(`${safeFormat(startDateAt)} ${startTimeAt}`, "dd/MM/yyyy", new Date()),
						parse(`${safeFormat(endDateAt)} ${endTimeAt}`, "dd/MM/yyyy", new Date()),
					)}
			</span>
		</div>
	);
};

const DetailRequest = ({
	handleFormOpen = () => {},
	state: { state, type, event, data },
}) => {
	const [detailState, setDetailState] = useState({
		state,
		type: [0, 1].includes(type) ? 0 : 1,
		event,
	});

    const [leaveRequestData] = useState({
        data
    });

	const queryClient = useQueryClient();

	const { onSubmit: onSubmitTimesheet, isLoading: isLoadingSubmitTimesheet } =
		useCustomMutation({
			api:
				LeaveRequestApi.approveLeaveRequest,
			onSuccess: (res) => {
				queryClient.setQueryData(["timesheetThisMonth"], {
					data: res.data,
				});
				handleFormOpen({ isOpen: false });
			},
			onError: (err) => {
				toast.error(err.message);
			},
			invalidateQueries: [["detailTimesheet", { id: state?.id }]],
		});

	const handleChangeViewDetail = (type) => {
		setDetailState((prev) => ({
			...prev,
			type,
		}));
	};

	if (detailState.type === 1) {
		return (
			<PreviewTimesheet
				handleChangeViewDetail={handleChangeViewDetail}
				state={detailState.event}
			/>
		);
	}

    const safeFormat = (date, dateFormat = "dd/MM/yyyy") => {
		try {
			return format(date, dateFormat);
		} catch {
			return "";
		}
	};

	const handleSubmit = (data, e) => {
		const payload = {
			start_at: safeFormat(
				add(
					parse(
						safeFormat(data.start_date_at) + " " + data.start_time_at,
						new Date(),
					),
					{ hours: getUTCOffsetInHours(data.timezone) },
				),
			),
			end_at: safeFormat(
				add(
					parse(
						safeFormat(data.end_date_at) + " " + data.end_time_at,
						new Date(),
					),
					{ hours: getUTCOffsetInHours(data.timezone) },
				),
			),
			title: data.title,
			timezone: data.timezone,
			description: "test",
			client_project_id: data.client_project_id,
			status: e.nativeEvent.submitter.value === "submit" ? 1 : 0,
		};

		if (detailState.type === 0 && type !== 0) {
			payload.id = state.id;
		}
        
		onSubmitTimesheet(payload, e);
	};

    useEffect(()=>{
        console.log(leaveRequestData);
        
    })

	return (
		<>
			<HookFormProvider
				// defaultValues={{
				// 	title: type === 0 ? null : state.title,
				// 	start_date_at:
				// 		type === 0 ? state?.startDateAt || new Date() : state.startDateAt,
				// 	start_time_at:
				// 		type === 0
				// 			? state?.startTimeAt || safeFormat(getNearest30Minutes())
				// 			: state.startTimeAt,
				// 	end_date_at:
				// 		type === 0 ? state?.endDateAt || new Date() : state.endDateAt,
				// 	end_time_at:
				// 		type === 0
				// 			? state?.endTimeAt ||
				// 				safeFormat(add(getNearest30Minutes(), { minutes: 30 }))
				// 			: state.endTimeAt,
				// 	description: type === 0 ? null : state.description,
				// 	client_project_id: type === 0 ? null : state.clientProjectId || null,
				// 	timezone:
				// 		type === 0
				// 			? state?.timezone ||
				// 				Intl.DateTimeFormat().resolvedOptions().timeZone
				// 			: state.timezone,
				// }}
				schema={TimesheetSchema}
				onSubmit={handleSubmit}
				className="flex-grow"
			>
                <div className="my-2 flex flex-col gap-2">
					<span className="font-medium">Name</span>
					<span className="inline-block rounded border border-black-400 bg-black-50 px-3 py-1 text-sm font-medium text-black">{leaveRequestData?.data?.user?.name}</span>
                </div>
                <div className="my-2 flex flex-col gap-2">
					<span className="font-medium">Leave Type</span>
					<span className="inline-block rounded border border-black-400 bg-black-50 px-3 py-1 text-sm font-medium text-black">{leaveRequestData?.data?.leaveType?.name}</span>
                </div>
				<div className="my-2 flex flex-col gap-2">
					<span className="font-medium">Time</span>
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                    <span className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-800">
                        Start : {leaveRequestData?.data?.startDate ? format(new Date(leaveRequestData.data.startDate), "dd-MM-yyyy") : "-"}
                    </span>
                    <span className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-800">
                        End : {leaveRequestData?.data?.endDate ? format(new Date(leaveRequestData.data.endDate), "dd-MM-yyyy") : "-"}
                    </span>
                    </div>
				</div>
				<div className="my-2 flex flex-col gap-2">
					<span className="font-medium">Description</span>
					<span className="inline-block rounded border border-black-400 bg-black-50 px-3 py-1 text-sm font-medium text-black">{leaveRequestData?.data?.description}</span>
                </div>
				<div className="mt-3 flex justify-end gap-2">
					<Button
						disabled={isLoadingSubmitTimesheet}
						className="w-36 bg-green-600 hover:bg-green-600 text-white hover:text-black"
						value="accept"
					>
						{isLoadingSubmitTimesheet ? <Spinner /> : "Accept"}
					</Button>
					<Button
						disabled={isLoadingSubmitTimesheet}
						className="w-36 bg-red-600 hover:bg-red-600 text-white hover:text-black"
						value="reject"
					>
						{isLoadingSubmitTimesheet ? <Spinner /> : "Reject"}
					</Button>
				</div>
			</HookFormProvider>
		</>
	);
};

DetailRequest.propTypes = {
	handleFormOpen: PropTypes.func,
	state: PropTypes.object,
};

export default DetailRequest;
