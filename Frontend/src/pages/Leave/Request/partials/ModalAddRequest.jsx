import React, { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { add, format, isAfter, isBefore, parse, sub } from "date-fns";
import { MoveRight, Pencil } from "lucide-react";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";

import LeaveRequestApi from "@/apis/v1/LeaveApi/LeaveRequestApi";
import { Spinner } from "@/components/atoms/Spinner";
import CalendarControl from "@/components/moleculs/Control/CalendarControl";
import InputControl from "@/components/moleculs/Control/InputControl";
import { Button } from "@/components/ui/Button";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { AddLeaveRequestSchema } from "@/schema/request/Leave/LeaveRequestSchema";
import { calculateWorkingDays, safeFormat } from "@/services/helper";

import LeaveTypeControl from "./LeaveTypeControl";

const DateControl = () => {
	const {
		formState: { errors },
		watch,
		setValue,
	} = useFormContext();

	const [startDateAt, endDateAt] = watch(["start_date_at", "end_date_at"]);

	const now = add(new Date(), { days: 1 });
	const earliestDate = now;
	const latestDate = add(now, { months: 1 });

	return (
		<>
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
						if (!endDateAt || isBefore(val, startDateAt)) {
							setValue("end_date_at", val);
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
				<span className="ml-10 hidden text-center text-sm md:col-auto md:block md:w-32">
					{startDateAt &&
						endDateAt &&
						`${calculateWorkingDays(
							parse(`${safeFormat(startDateAt)}`, "dd/MM/yyyy", new Date()),
							parse(`${safeFormat(endDateAt)}`, "dd/MM/yyyy", new Date()),
						)} work days`}
				</span>
			</div>
			<span className="text-sm font-normal text-red-500 dark:text-red-900">
				{errors["dummy_key"]?.message}
			</span>
		</>
	);
};

const ModalRequest = ({
	handleFormOpen = () => {},
	state: { state, type },
}) => {
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

	const handleSubmit = (data, e) => {
		const payload = {
			startDate: format(data.start_date_at, "yyyy-MM-dd"),
			endDate: format(data.end_date_at, "yyyy-MM-dd"),
			description: data.description,
			leaveType: data.leave_type_id,
		};

		onSubmitRequest(payload, e);
	};

	return (
		<>
			<HookFormProvider
				defaultValues={{
					start_date_at: add(new Date(), { days: 1 }),
					end_date_at: add(new Date(), { days: 1 }),
					description: type === 0 ? null : state.description,
				}}
				schema={AddLeaveRequestSchema}
				onSubmit={handleSubmit}
				className="flex-grow"
			>
				<div className="my-2 flex flex-col gap-2">
					<LeaveTypeControl />
				</div>
				<div className="my-2 flex flex-col gap-2">
					<span className="font-normal">Date</span>
					<DateControl />
				</div>
				<div className="my-2 flex flex-col gap-2">
					<span className="font-normal">Description</span>
					<InputControl
						placeholder={"Description"}
						name={"description"}
						leftAddOn={
							<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm text-muted-foreground peer-disabled:opacity-50">
								<Pencil className="size-4" />
							</span>
						}
						className="peer pl-10"
					/>
				</div>
				<div className="mt-3 flex justify-end gap-2">
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
