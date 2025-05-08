import React, { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { add, format, isAfter, parse, sub } from "date-fns";
import { MoveRight, Pencil } from "lucide-react";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";

import LeaveRequestApi from "@/apis/v1/LeaveApi/LeaveRequestApi";
import LeaveTypeApi from "@/apis/v1/LeaveApi/LeaveTypeApi";
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
import PreviewTimesheet from "@/pages/Timesheet/MonthlyTimesheet/partials/PreviewTimesheet";
import HookFormProvider from "@/providers/HookFormProvider";
import { TimesheetSchema } from "@/schema/request/Timesheet/FormTimesheetSchema";
import { calculateTimeDifferenceDays } from "@/services/helper";

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
			return parse(timeStr, "HH:mm", new Date());
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
		<div className="grid grid-cols-4 gap-2 place-items-center md:grid-cols-12">
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
						setValue("end_time_at", format(adjusted, "HH:mm"));
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
			<span className="hidden text-sm text-center md:col-auto md:block md:w-32">
				{startDateAt &&
					endDateAt &&
					startTimeAt &&
					endTimeAt &&
					calculateTimeDifferenceDays(
						parse(
							`${safeFormat(startDateAt)} ${startTimeAt}`,
							"dd/MM/yyyy HH:mm",
							new Date(),
						),
						parse(
							`${safeFormat(endDateAt)} ${endTimeAt}`,
							"dd/MM/yyyy HH:mm",
							new Date(),
						),
					)}
			</span>
		</div>
	);
};

const ModalRequest = ({
	handleFormOpen = () => { },
	state: { state, type, event },
}) => {
	const [detailState, setDetailState] = useState({
		state,
		type: [0, 1].includes(type) ? 0 : 1,
		event,
	});

	const queryClient = useQueryClient();

	const { onSubmit: onSubmitRequest, isLoading: isLoadingSubmitRequest } =
		useCustomMutation({
			api: LeaveRequestApi.createLeaveRequest,
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

	const handleSubmit = (data, e) => {
		const payload = {
			startDate: format(data.start_date_at, "yyyy-MM-dd"),
			endDate: format(data.end_date_at, "yyyy-MM-dd"),
			description: data.description,
			leaveType: data.leavetype_id,
		};

		onSubmitRequest(payload, e);
	};

	return (
		<>
			<HookFormProvider
				defaultValues={{
					start_date_at:
						type === 0 ? state?.startDateAt || new Date() : state.startDateAt,
					end_date_at:
						type === 0 ? state?.endDateAt || new Date() : state.endDateAt,
					description: type === 0 ? null : state.description,
				}}
				// schema={TimesheetSchema}
				onSubmit={handleSubmit}
				className="flex-grow"
			>
				<div className="flex flex-col gap-2 my-2">
					<LeaveTypeControl />
				</div>
				<div className="flex flex-col gap-2 my-2">
					<span className="font-normal">Time</span>
					<DateTimesheetControl />
				</div>
				<div className="flex flex-col gap-2 my-2">
					<span className="font-normal">Description</span>
					<InputControl
						placeholder={"Description"}
						name={"description"}
						leftAddOn={
							<span className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm pointer-events-none text-muted-foreground peer-disabled:opacity-50">
								<Pencil className="size-4" />
							</span>
						}
						className="pl-10 peer"
					/>
				</div>
				<div className="flex justify-end gap-2 mt-3">
					<Button
						type="submit"
						disabled={isLoadingSubmitRequest}
						className="w-36"
						value="submit"
					>
						{isLoadingSubmitRequest ? <Spinner /> : "Submit"}
					</Button>
				</div>
			</HookFormProvider>
		</>
	);
};

ModalRequest.propTypes = {
	handleFormOpen: PropTypes.func,
	state: PropTypes.object,
};

export default ModalRequest;
