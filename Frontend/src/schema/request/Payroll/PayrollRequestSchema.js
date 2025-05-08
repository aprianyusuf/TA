import { isAfter } from "date-fns";
import * as Yup from "yup";

export const AddPayrollPeriodSchema = Yup.object().shape({
    year: Yup.number().required('* Field is required'),
    month: Yup.number().required('* Field is required'),
    start_at: Yup.date().required('* Field is required'),
    end_at: Yup.date().required('* Field is required'),
    payroll_at: Yup.date().required('* Field is required'),
    is_generate_payrolls: Yup.string().required('* Field is required').default(false),
});

export const AddPayrollSchema = Yup.object().shape({
    employee_id: Yup.string().required('* Field is required'),
    payroll_period_id: Yup.string(). required('* Field is required'),
    salary: Yup.string().required('* Field is required'),
})
