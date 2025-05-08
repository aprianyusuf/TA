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
import { AddPayrollPeriodSchema } from "@/schema/request/Payroll/PayrollRequestSchema";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import CheckboxControl from "@/components/moleculs/Control/CheckboxControl";

const ModalAddPeriod = ({
    handleFormOpen = () => { },
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
            api: PayrollPeriodApi.createPayrollPeriod, // This should be your API call
            onSuccess: (res) => {
                queryClient.setQueryData(["payrollPeriod"], { data: res.data });
                handleFormOpen({ isOpen: false }); // Close the form after success
            },
            onError: (err) => {
                toast.error(err.message); // Show error message on failure
            },
            invalidateQueries: [["payrollPeriod", { id: state?.id }], "payroll-period"],
        });

    const handleSubmit = (data) => {
        const payload = {
            month: data.month,
            year: data.year,
            startAt: format(data.start_date, "yyyy-MM-dd"),
            endAt: format(data.end_date, "yyyy-MM-dd"),
            payrollAt: format(data.payroll_at, "yyyy-MM-dd"),
            is_generate_payrolls: data.is_generate_payrolls, // Include this field in the payload
        };

        console.log(payload);
        onSubmitPayrollPeriod(payload);
    };

    const months = [
        { id: 1, name: "January" },
        { id: 2, name: "February" },
        { id: 3, name: "March" },
        { id: 4, name: "April" },
        { id: 5, name: "May" },
        { id: 6, name: "June" },
        { id: 7, name: "July" },
        { id: 8, name: "August" },
        { id: 9, name: "September" },
        { id: 10, name: "October" },
        { id: 11, name: "November" },
        { id: 12, name: "December" },
    ];

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - 5 + i;
        return { id: year, name: year.toString() };
    });

    const [monthData] = useState(months);
    const [yearData] = useState(years);


    return (
        <>
            <HookFormProvider
                onSubmit={handleSubmit}
                defaultValues={{
                    month: null,
                    year: null,
                    start_date: null,
                    end_date: null,
                    is_generate_payrolls: false, // ✅ this is required
                }}

                // schema={AddPayrollPeriodSchema}
                className="flex flex-col gap-3"
            >
                <SelectControl
                    label="Month"
                    name="month"
                    options={monthData.map((m) => ({
                        value: m.id,
                        label: m.name,
                    }))}
                />

                <SelectControl
                    label="Year"
                    name="year"
                    options={yearData.map((y) => ({
                        value: y.id,
                        label: y.name,
                    }))}
                />

                <CalendarControl
                    label="Start Date"
                    name="start_date"
                />

                <CalendarControl
                    label="End Date"
                    name="end_date"
                />

                <CalendarControl
                    label="Payroll at"
                    name="payroll_at"
                />

                <CheckboxControl
                    name="is_generate_payrolls"
                    label="Generate employee payrolls?"
                />

                <div className="flex justify-end">
                    <Button disabled={isLoadingSubmitPayrollPeriod} className="w-40">
                        {isLoadingSubmitPayrollPeriod ? <Spinner /> : "Add Period"}
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
