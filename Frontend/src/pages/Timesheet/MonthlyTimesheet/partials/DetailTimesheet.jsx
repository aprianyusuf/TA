import React, { useState } from "react";

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
	calculateTimeDifference,
	getNearest30Minutes,
	getUTCOffsetInHours,
} from "@/services/helper";

import PreviewTimesheet from "./PreviewTimesheet";

const DateTimesheetControl = () => {
	const { watch, setValue } = useFormContext();

	const [startDateAt, startTimeAt, endDateAt, endTimeAt] = watch([
		"start_date_at",
		"start_time_at",
		"end_date_at",
		"end_time_at",
	]);

	return (
		<div className="grid grid-cols-4 place-items-center gap-2 md:grid-cols-12">
			<CalendarControl
				name="start_date_at"
				onChangeListen={(val) => {
					if (isAfter(val, endDateAt)) {
						setValue("end_date_at", val);
					}
				}}
				calendarProps={{
					disabled: {
						before: new Date(
							new Date().getFullYear(),
							new Date().getMonth() - 1,
							new Date().getDate(),
						),
						after: new Date(
							new Date().getFullYear(),
							new Date().getMonth() + 1,
							new Date().getDate(),
						),
					},
				}}
				className="col-span-3"
			/>
			<SelectControl
				name={"start_time_at"}
				options={Array.from({ length: 24 * 4 }).map((_, i) => {
					const hours = Math.floor(i / 4);
					const minutes = (i % 4) * 15;
					const time = new Date(0, 0, 0, hours, minutes).toLocaleTimeString(
						"en-GB",
						{
							hour: "2-digit",
							minute: "2-digit",
						},
					);
					return {
						label: time,
						value: time,
					};
				})}
				setter={(val) => {
					if (
						format(endDateAt, "dd/MM/yyyy") ===
							format(startDateAt, "dd/MM/yyyy") &&
						val.value >= endTimeAt
					) {
						setValue(
							"end_time_at",
							format(
								add(parse(val.value, "HH:mm", new Date()), { minutes: 30 }),
								"HH:mm",
							),
						);
					}
				}}
				placeholder={"00:00"}
				className="col-span-2"
			/>
			<MoveRight className="hidden size-0 md:col-auto md:block md:size-5" />
			<CalendarControl
				name="end_date_at"
				onChangeListen={(val) => {
					if (
						format(val, "dd/MM/yyyy") === format(startDateAt, "dd/MM/yyyy") &&
						startTimeAt > endTimeAt
					) {
						setValue(
							"end_time_at",
							format(
								add(parse(startTimeAt, "HH:mm", new Date()), { minutes: 30 }),
								"HH:mm",
							),
						);
					}
				}}
				calendarProps={{
					disabled: {
						before: startDateAt,
						after: new Date(
							new Date().getFullYear(),
							new Date().getMonth() + 1,
							new Date().getDate(),
						),
					},
				}}
				className="col-span-3"
			/>
			<SelectControl
				name={"end_time_at"}
				options={Array.from({ length: 24 * 4 })
					.map((_, i) => {
						const hours = Math.floor(i / 4);
						const minutes = (i % 4) * 15;
						const time = new Date(0, 0, 0, hours, minutes).toLocaleTimeString(
							"en-GB",
							{
								hour: "2-digit",
								minute: "2-digit",
							},
						);
						return {
							label: time,
							value: time,
						};
					})
					.filter((val) => {
						if (
							format(endDateAt, "dd/MM/yyyy") ===
							format(startDateAt, "dd/MM/yyyy")
						) {
							return val.value > startTimeAt;
						} else {
							return val;
						}
					})}
				placeholder={"00:00"}
				className="col-span-2"
			/>
			<span className="hidden text-center text-sm md:col-auto md:block md:w-32">
				{calculateTimeDifference(
					parse(
						`${format(startDateAt, "dd/MM/yyyy")} ${startTimeAt}`,
						"dd/MM/yyyy HH:mm",
						new Date(),
					),
					parse(
						`${format(endDateAt, "dd/MM/yyyy")} ${endTimeAt}`,
						"dd/MM/yyyy HH:mm",
						new Date(),
					),
				)}
			</span>
		</div>
	);
};

const EmployeeProject = () => {
	const { watch } = useFormContext();

	const [start_date_at] = watch(["start_date_at"]);

	const { data: employeeProject, isLoading: isLoadingEmployeeProject } =
		useCustomQuery({
			api: ClientApi.getEmployeeProject,
			queryKey: [
				"getEmployeeProject",
				{ start_date_at: format(start_date_at, "yyyy-MM-dd") },
			],
			queryParams: { start_date_at: format(start_date_at, "yyyy-MM-dd") },
		});

	return (
		<SelectControl
			label={"Project"}
			options={employeeProject?.data}
			isLoading={isLoadingEmployeeProject}
			name={"client_project_id"}
			isClearable
		/>
	);
};

const DetailTimesheet = ({
	handleFormOpen = () => {},
	state: { state, type, event },
}) => {
	const [detailState, setDetailState] = useState({
		state,
		type: [0, 1].includes(type) ? 0 : 1,
		event,
	});

	const queryClient = useQueryClient();

	const { onSubmit: onSubmitTimesheet, isLoading: isLoadingSubmitTimesheet } =
		useCustomMutation({
			api:
				type === 0
					? MonthlyTimesheetApi.addTimesheet
					: MonthlyTimesheetApi.updateTimesheet,
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
			start_at: format(
				add(
					parse(
						format(data.start_date_at, "yyyy-MM-dd") + " " + data.start_time_at,
						"yyyy-MM-dd HH:mm",
						new Date(),
					),
					{ hours: getUTCOffsetInHours(data.timezone) },
				),
				"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
			),
			end_at: format(
				add(
					parse(
						format(data.end_date_at, "yyyy-MM-dd") + " " + data.end_time_at,
						"yyyy-MM-dd HH:mm",
						new Date(),
					),
					{ hours: getUTCOffsetInHours(data.timezone) },
				),
				"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
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

	return (
		<>
			<HookFormProvider
				defaultValues={{
					title: type === 0 ? null : state.title,
					start_date_at:
						type === 0 ? state?.startDateAt || new Date() : state.startDateAt,
					start_time_at:
						type === 0
							? state?.startTimeAt || format(getNearest30Minutes(), "HH:mm")
							: state.startTimeAt,
					end_date_at:
						type === 0 ? state?.endDateAt || new Date() : state.endDateAt,
					end_time_at:
						type === 0
							? state?.endTimeAt ||
								format(add(getNearest30Minutes(), { minutes: 30 }), "HH:mm")
							: state.endTimeAt,
					description: type === 0 ? null : state.description,
					client_project_id: type === 0 ? null : state.clientProjectId || null,
					timezone:
						type === 0
							? state?.timezone ||
								Intl.DateTimeFormat().resolvedOptions().timeZone
							: state.timezone,
				}}
				schema={TimesheetSchema}
				onSubmit={handleSubmit}
				className="flex-grow"
			>
				<InputControl
					placeholder={"Title"}
					name={"title"}
					leftAddOn={
						<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm text-muted-foreground peer-disabled:opacity-50">
							<Pencil className="size-4" />
						</span>
					}
					className="peer pl-10"
				/>
				<SelectControl
					name={"timezone"}
					label={"Timezone"}
					options={getTimeZones()}
					className={"my-2"}
				/>
				<div className="my-2 flex flex-col gap-2">
					<span className="font-medium">Time</span>
					<DateTimesheetControl />
				</div>
				<EmployeeProject />
				<div className="mt-3 flex justify-end gap-2">
					<Button
						disabled={isLoadingSubmitTimesheet}
						className="w-36"
						value="submit"
					>
						{isLoadingSubmitTimesheet ? <Spinner /> : "Submit"}
					</Button>
					<Button
						disabled={isLoadingSubmitTimesheet}
						variant="outline"
						className="w-36"
						value="draft"
					>
						{isLoadingSubmitTimesheet ? <Spinner /> : "Save as Draft"}
					</Button>
				</div>
			</HookFormProvider>
		</>
	);
};

DetailTimesheet.propTypes = {
	handleFormOpen: PropTypes.func,
	state: PropTypes.object,
};

export default DetailTimesheet;
