import React from "react";

import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { format } from "date-fns";
import { invert } from "lodash";
import {
	CheckCircle,
	CheckCircle2,
	CircleDotDashed,
	Clock,
	Hourglass,
	RotateCcw,
	Send,
	XCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import MonthlyTimesheetApi from "@/apis/v1/TimesheetApi/MonthlyTimesheetApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputTextAreaControl from "@/components/moleculs/Control/InputTextAreaControl";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
	TIMESHEET_APPROVAL_STATUS,
	TIMESHEET_STATUS,
} from "@/configs/constant";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { cn } from "@/libs/utils";
import HookFormProvider from "@/providers/HookFormProvider";
import {
	capitalizeFirstLetter,
	getInitialName,
	toGmt,
} from "@/services/formatter";
import { calculateTimeDifference } from "@/services/helper";
import { useBoundLocalStore } from "@/stores";

const ApprovalForm = ({ id, timesheetId }) => {
	const queryClient = useQueryClient();
	const selectedAs = useBoundLocalStore((state) => state.selectedAs);

	const { onSubmit: onSubmitApprove, isLoading: isLoadingApprove } =
		useCustomMutation({
			api: MonthlyTimesheetApi.approval,
			invalidateQueries: [
				["detailTimesheet", { id: timesheetId }],
				["getSubordinates"],
			],
			onSuccess: (res) => {
				toast.success(res.message);
				queryClient.setQueryData(["timesheetByUser", { id: selectedAs }], {
					data: res.data,
				});
			},
			onError: (err) => {
				toast.error(err.message);
			},
		});

	const handleSubmit = (data, e) => {
		onSubmitApprove(
			{
				id: data.id,
				timesheet_id: data.timesheet_id,
				status: +e.nativeEvent.submitter.value,
				notes: data.notes,
			},
			e,
		);
	};

	return (
		<HookFormProvider
			defaultValues={{
				id,
				timesheet_id: timesheetId,
				notes: null,
			}}
			className="mt-2"
			onSubmit={handleSubmit}
		>
			<InputTextAreaControl name="notes" label="Notes" />
			<div className="mt-2 flex gap-2" role="action">
				<Button
					disabled={isLoadingApprove}
					variant="destructive"
					className="w-24"
					value={TIMESHEET_APPROVAL_STATUS.REJECTED}
				>
					{isLoadingApprove ? <Spinner /> : "Reject"}
				</Button>
				<Button
					disabled={isLoadingApprove}
					variant="secondary"
					className="w-24"
					value={TIMESHEET_APPROVAL_STATUS.REVISED}
				>
					{isLoadingApprove ? <Spinner /> : "Revise"}
				</Button>
				<Button
					disabled={isLoadingApprove}
					className="w-24"
					value={TIMESHEET_APPROVAL_STATUS.APPROVED}
				>
					{isLoadingApprove ? <Spinner /> : "Approve"}
				</Button>
			</div>
		</HookFormProvider>
	);
};

ApprovalForm.propTypes = {
	id: PropTypes.number,
	timesheetId: PropTypes.number,
};

const PreviewTimesheet = ({
	handleChangeViewDetail = () => {},
	state = {},
}) => {
	const selectedAs = useBoundLocalStore((state) => state.selectedAs);

	const { data: detailTimesheet, isLoading: isLoadingDetailTimesheet } =
		useCustomQuery({
			api: MonthlyTimesheetApi.showTimesheet,
			queryKey: ["detailTimesheet", { id: state.id }],
			queryParams: { id: state.id },
		});

	if (isLoadingDetailTimesheet) {
		return (
			<div className="flex h-36 w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="flex flex-grow flex-col gap-2 md:flex-grow-0">
			{detailTimesheet?.data?.project ? (
				<Card className={cn("px-2 py-1 md:px-4")}>
					<CardHeader className="py- border-b">
						<CardTitle>{detailTimesheet?.data?.project?.name}</CardTitle>
						<CardDescription>
							{detailTimesheet?.data?.project?.client}
						</CardDescription>
					</CardHeader>
					<CardContent className="px-2 py-2 md:px-4">
						<table>
							<tbody>
								<tr>
									<td className="w-32 text-sm font-bold md:w-40 md:text-base">
										Timeline
									</td>
									<td className="text-sm md:text-base">
										{format(
											detailTimesheet?.data?.project?.startDateAt,
											"dd MMMM yyyy",
										)}{" "}
										-{" "}
										{format(
											detailTimesheet?.data?.project?.endDateAt,
											"dd MMMM yyyy",
										)}
									</td>
								</tr>
								<tr>
									<td className="w-32 text-sm font-bold md:w-40 md:text-base">
										Cut Off Timesheet
									</td>
									<td className="text-sm md:text-base">
										{detailTimesheet?.data?.project?.cutOffTimesheetStartDay} -{" "}
										{detailTimesheet?.data?.project?.cutOffTimesheetEndDay}
									</td>
								</tr>
								<tr>
									<td className="w-32 text-sm font-bold md:w-40 md:text-base">
										Project Manager
									</td>
									<td className="text-sm md:text-base">
										{detailTimesheet?.data?.project?.projectManager}
									</td>
								</tr>
								{/* TODO is need to show project color (?) */}
								{/* <tr>
									<td className='w-32 text-sm font-bold md:w-40 md:text-base'>Project Color</td>
									<td className='text-sm md:text-base'><div className='w-20 h-4 rounded-sm' style={{
										background: detailTimesheet?.data?.project?.color
									}} /></td>
								</tr> */}
							</tbody>
						</table>
					</CardContent>
				</Card>
			) : null}
			<Card className="px-2 py-1 md:px-4">
				<CardHeader className="border-b py-1">
					<CardTitle>Data</CardTitle>
				</CardHeader>
				<CardContent className="px-2 py-2 md:px-4">
					<table>
						<tbody>
							<tr>
								<td className="w-32 text-sm font-bold md:w-40 md:text-base">
									Title
								</td>
								<td className="text-sm md:text-base">
									{detailTimesheet?.data?.timesheet?.title}
								</td>
							</tr>
							<tr>
								<td className="w-32 text-sm font-bold md:w-40 md:text-base">
									Timezone
								</td>
								<td className="text-sm md:text-base">
									{detailTimesheet?.data?.timesheet?.timezone}
								</td>
							</tr>
							<tr>
								<td className="w-32 text-sm font-bold md:w-40 md:text-base">
									Time
								</td>
								<td className="text-sm md:text-base">
									{toGmt(
										detailTimesheet?.data?.timesheet?.start.replace(/T/g, " "),
										detailTimesheet?.data?.timesheet?.timezone,
										"yyyy-MM-dd HH:mm:ss",
										"dd MMMM yyyy HH:mm",
									)}{" "}
									to{" "}
									{toGmt(
										detailTimesheet?.data?.timesheet?.end.replace(/T/g, " "),
										detailTimesheet?.data?.timesheet?.timezone,
										"yyyy-MM-dd HH:mm:ss",
										"yyyy-MM-dd",
									) ===
									toGmt(
										detailTimesheet?.data?.timesheet?.start.replace(/T/g, " "),
										detailTimesheet?.data?.timesheet?.timezone,
										"yyyy-MM-dd HH:mm:ss",
										"yyyy-MM-dd",
									)
										? toGmt(
												detailTimesheet?.data?.timesheet?.end.replace(
													/T/g,
													" ",
												),
												detailTimesheet?.data?.timesheet?.timezone,
												"yyyy-MM-dd HH:mm:ss",
												"HH:mm",
											)
										: toGmt(
												detailTimesheet?.data?.timesheet?.end.replace(
													/T/g,
													" ",
												),
												detailTimesheet?.data?.timesheet?.timezone,
												"yyyy-MM-dd HH:mm:ss",
												"dd MMMM yyyy HH:mm",
											)}
								</td>
							</tr>
							<tr>
								<td className="w-32 text-sm font-bold md:w-40 md:text-base">
									Duration
								</td>
								<td className="text-sm md:text-base">
									{calculateTimeDifference(
										toGmt(
											detailTimesheet?.data?.timesheet?.start.replace(
												/T/g,
												" ",
											),
											detailTimesheet?.data?.timesheet?.timezone,
											"yyyy-MM-dd HH:mm:ss",
										),
										toGmt(
											detailTimesheet?.data?.timesheet?.end.replace(/T/g, " "),
											detailTimesheet?.data?.timesheet?.timezone,
											"yyyy-MM-dd HH:mm:ss",
										),
									)}
								</td>
							</tr>
							<tr>
								<td className="w-32 text-sm font-bold md:w-40 md:text-base">
									Description
								</td>
								<td className="text-sm md:text-base">
									{detailTimesheet?.data?.timesheet?.description}
								</td>
							</tr>
						</tbody>
					</table>
				</CardContent>
			</Card>
			<Tabs
				defaultValue={
					detailTimesheet?.data?.approval?.length > 0 ? "approval" : "log"
				}
			>
				<TabsList className={cn("grid w-1/2 grid-cols-2 md:w-1/3")}>
					<TabsTrigger
						value="approval"
						disabled={detailTimesheet?.data?.approval?.length === 0}
					>
						Approval
					</TabsTrigger>
					<TabsTrigger value="log">Log</TabsTrigger>
				</TabsList>
				{detailTimesheet?.data?.approval?.length > 0 ? (
					<TabsContent value="approval">
						{detailTimesheet?.data?.approval?.length > 0
							? detailTimesheet?.data?.approval?.map((a, i) => {
									return (
										<div key={a.id} className="mb-2 flex min-h-fit space-x-3">
											<div className="flex flex-col items-center space-y-1">
												<div
													aria-label="point"
													className="size-10 rounded-full border"
												>
													<Avatar className="rounded-lg">
														<AvatarFallback className="rounded-lg">
															{getInitialName(a.approval)}
														</AvatarFallback>
													</Avatar>
												</div>
												<div
													aria-label="line"
													className={clsx({
														"w-[2px] flex-grow rounded-md bg-primary/40":
															i !== detailTimesheet?.data?.approval.length - 1,
													})}
												/>
											</div>
											<div className="flex w-full flex-col rounded-md border p-2">
												<span className="mb-1 text-sm font-bold">
													{a.approval}
												</span>
												<span className="flex items-center">
													<span
														className={cn(
															"flex w-fit items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-secondary",
															clsx({
																"bg-yellow-400 text-slate-700":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.PENDING,
																"bg-yellow-300 text-slate-700":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.WAITING,
																"bg-green-500 text-slate-100":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.APPROVED,
																"bg-red-500 text-slate-100":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.REJECTED,
																"bg-orange-400 text-slate-100":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.REVISED,
															}),
														)}
													>
														{a.isActive ||
														a.status === TIMESHEET_APPROVAL_STATUS.PENDING ? (
															<Clock
																size={12}
																key={a.id}
																className="size-4 text-slate-700"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.APPROVED ? (
															<CheckCircle2
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.WAITING ? (
															<Hourglass
																size={12}
																key={a.id}
																className="size-4 text-slate-700"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.REJECTED ? (
															<XCircle
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.REVISED ? (
															<CircleDotDashed
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : null}
														<span aria-label="status">
															{capitalizeFirstLetter(
																invert(TIMESHEET_APPROVAL_STATUS)[
																	a.status
																].toLowerCase(),
															)}
														</span>
													</span>
												</span>
												{a.isActive &&
												a.status === TIMESHEET_APPROVAL_STATUS.PENDING ? (
													<ApprovalForm
														id={a.id}
														timesheetId={detailTimesheet?.data?.timesheet?.id}
													/>
												) : null}
											</div>
										</div>
									);
								})
							: null}
					</TabsContent>
				) : null}
				<TabsContent value="log">
					{detailTimesheet?.data?.logTimesheet?.length > 0
						? detailTimesheet?.data?.logTimesheet
								?.sort((a, b) => {
									if (a.status === 7) return -1;
									if (b.status === 7) return 1;
									return 0;
								})
								.map((a, i) => {
									return (
										<div key={a.id} className="mb-2 flex min-h-fit space-x-3">
											<div className="flex flex-col items-center space-y-1">
												<div
													aria-label="point"
													className="size-10 rounded-full border"
												>
													<Avatar className="rounded-lg">
														<AvatarFallback className="rounded-lg">
															{getInitialName(a.user)}
														</AvatarFallback>
													</Avatar>
												</div>
												<div
													aria-label="line"
													className={clsx({
														"w-[2px] flex-grow rounded-md bg-primary/40":
															i !==
															detailTimesheet?.data?.logTimesheet.length - 1,
													})}
												/>
											</div>
											<div className="flex w-full flex-col rounded-md border p-2">
												<span className="mb-1 text-sm font-bold">{a.user}</span>
												<span className="flex items-center">
													<span
														className={cn(
															"flex w-fit items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-secondary",
															clsx({
																"bg-green-600 text-slate-100":
																	detailTimesheet?.data?.timesheet?.status ===
																	TIMESHEET_STATUS.COMPLETED,
																"bg-green-400 text-slate-100": [
																	TIMESHEET_APPROVAL_STATUS.SUBMIT,
																	TIMESHEET_APPROVAL_STATUS.RESUBMIT,
																].includes(a.status),
																"bg-green-500 text-slate-100":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.APPROVED,
																"bg-orange-400 text-slate-100":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.REVISED,
																"bg-red-500 text-slate-100":
																	a.status ===
																	TIMESHEET_APPROVAL_STATUS.REJECTED,
															}),
														)}
													>
														{a.status === TIMESHEET_APPROVAL_STATUS.SUBMIT ? (
															<Send size={12} key={a.id} className="size-4" />
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.REJECTED ? (
															<XCircle
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.REVISED ? (
															<CircleDotDashed
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.APPROVED ? (
															<CheckCircle2
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : a.status ===
														  TIMESHEET_APPROVAL_STATUS.RESUBMIT ? (
															<RotateCcw
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : detailTimesheet?.data?.timesheet?.status ===
														  TIMESHEET_STATUS.COMPLETED ? (
															<CheckCircle
																size={12}
																key={a.id}
																className="size-4"
															/>
														) : null}
														<span aria-label="status">
															{capitalizeFirstLetter(
																invert(TIMESHEET_APPROVAL_STATUS)[
																	a.status
																].toLowerCase(),
															)}
														</span>
													</span>
												</span>
												{a.notes ? (
													<span className="my-1 text-sm">{a.notes}</span>
												) : null}
												<span aria-label="executed_at" className="text-sm">
													{format(
														toGmt(a.executedAt),
														"cccc, dd MMMM yyyy HH:mm:ss",
													)}
												</span>
											</div>
										</div>
									);
								})
						: null}
				</TabsContent>
			</Tabs>
			<div className="flex justify-end gap-2">
				{[TIMESHEET_STATUS.DRAFT, TIMESHEET_STATUS.REVISED].includes(
					detailTimesheet?.data?.timesheet?.status,
				) && selectedAs === "My Self" ? (
					<Button onClick={() => handleChangeViewDetail(0)}>Edit</Button>
				) : null}
			</div>
		</div>
	);
};

PreviewTimesheet.propTypes = {
	handleChangeViewDetail: PropTypes.func,
	state: PropTypes.object,
};

export default PreviewTimesheet;
