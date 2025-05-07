import React, { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { add, format, isAfter, parse, sub } from "date-fns";
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
import { TimesheetSchema } from "@/schema/request/Timesheet/FormTimesheetSchema";
import {
	calculateTimeDifferenceDays,
} from "@/services/helper";
import PreviewTimesheet from "@/pages/Timesheet/MonthlyTimesheet/partials/PreviewTimesheet";
import PayrollPeriodApi from "@/apis/v1/PayrollApi/PayrollPeriodApi";

const ModalAddPeriod = ({
	handleFormOpen = () => {},
	state: { state, type, event },
}) => {
	const [detailState, setDetailState] = useState({
		state,
		type: [0, 1].includes(type) ? 0 : 1,
		event,
	});

	const queryClient = useQueryClient();

	const { onSubmit: onSubmitPayrollPeriod, isLoading: isLoadingSubmitPayrollPeriod } =
		useCustomMutation({
			api:
				PayrollPeriodApi.createPayrollPeriod,
			onSuccess: (res) => {
				queryClient.setQueryData(["payrollPeriod"], {
					data: res.data,
				});
				handleFormOpen({ isOpen: false });
			},
			onError: (err) => {
				toast.error(err.message);
			},
			invalidateQueries: [["payrollPeriod", { id: state?.id }]],
		});

	const handleSubmit = (data, e) => {
		const payload = {
			start_date_at: format(
				add(
					parse(
						format(data.start_date_at, "yyyy-MM-dd") + " " + data.start_time_at,
						"yyyy-MM-dd HH:mm",
						new Date(),
					),
					// { hours: getUTCOffsetInHours(data.timezone) },
				),
				"yyyy-MM-dd",
			),
			end_date_at: format(
				add(
					parse(
						format(data.end_date_at, "yyyy-MM-dd") + " " + data.end_time_at,
						"yyyy-MM-dd HH:mm",
						new Date(),
					),
				),
				"yyyy-MM-dd",
			),
			description: "test",
			status: e.nativeEvent.submitter.value === "submit" ? 1 : 0,
		};

		if (detailState.type === 0 && type !== 0) {
			payload.id = state.id;
		}

		onSubmitPayrollPeriod(payload, e);
	};

    const PeriodDatePicker = () => {
        const { watch, setValue } = useFormContext();
        const [startDateAt, endDateAt] = watch([
            "start_at",
            "end_at",
        ]);
        return (
            <div className="grid grid-cols-4 place-items-center gap-2 md:grid-cols-12">
                <CalendarControl
				name="start_at"
				onChangeListen={(val) => {
					if (!val) return;
					if (!endDateAt || isAfter(val, endDateAt)) {
						setValue("end_at", val);
					}
				}}
				className="col-span-3"
                />
                <MoveRight className="hidden size-0 md:col-auto md:block md:size-5" />
                <CalendarControl
                    name="end_at"
                    onChangeListen={(val) => {
                        if (!val) return;
                    }}
                    calendarProps={{
                        disabled: {
                            before: startDateAt,
                            after: add(startDateAt, { months: 1 }),
                        },
                    }}
                className="col-span-3"
                />  
            </div>
        );
    };

    const PayrollDatePicker = () => {
        const { watch } = useFormContext();
        const [startDateAt, endDateAt] = watch(["start_at", "end_at"]);
    
        return (
            <div className="my-2 flex flex-col gap-2">
                <span className="font-normal">Payroll at</span>
                <CalendarControl
                    name="selected_date"
                    onChangeListen={(val) => {
                        if (!val) return;
                    }}
                    calendarProps={{
                        disabled: {
                            before: startDateAt,
                            after: endDateAt,
                        },
                    }}
                    className="col-span-4 md:col-span-3"
                />
            </div>
        );
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
				schema={TimesheetSchema}
				onSubmit={handleSubmit}
				className="flex-grow"
			>
				<div className="my-2 flex flex-col gap-2">
                    <span className="font-normal">Year</span>
                    <select
                        name="year"
                        className="rounded-md border border-gray-300 p-2"
                    >
                        <option value="">Select year</option>
                        {Array.from({ length: 21 }, (_, i) => 2020 + i).map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="my-2 flex flex-col gap-2">
                    <span className="font-normal">Month</span>
                    <select
                        name="month"
                        className="rounded-md border border-gray-300 p-2"
                    >
                        <option value="">Select month</option>
                        {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ].map((month, index) => (
                            <option key={index} value={index + 1}>{month}</option>
                        ))}
                    </select>
                </div>
                <div className="my-2 flex flex-col gap-2">
					<span className="font-normal">Start at - End at</span>
					<PeriodDatePicker/>
				</div>
                <div className="my-2 flex flex-col gap-2">
                    <PayrollDatePicker/>
				</div>
                <div className="my-4">
                    <label className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="generate_payrolls"
                            value={1}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2"
                        />
                        <span>Generate Payrolls</span>
                    </label>
                </div>
				<div className="mt-3 flex justify-end gap-2">
					<Button
						type="submit"
						disabled={isLoadingSubmitPayrollPeriod}
						className="w-36"
						value="submit"
					>
						{isLoadingSubmitPayrollPeriod ? <Spinner /> : "Submit"}
					</Button>
				</div>
			</HookFormProvider>
		</>
	);
};

ModalAddPeriod.propTypes = {
	handleFormOpen: PropTypes.func,
	state: PropTypes.object,
};

export default ModalAddPeriod;
