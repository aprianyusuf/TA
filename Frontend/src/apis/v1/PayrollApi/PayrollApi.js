import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
    // getAll: (params) => GET({ path: `/payroll`, params }),
    getPayrollsByPeriod: ({ id, ...payload }) =>
        GET({ path: `/payroll_period/${id}/payrolls`, payload }),
    show: (params)=>GET({path: `/payroll_period/${id}/payrolls`, params}),
    update: ({id, ...payload})=> PUT({path: `payroll/${payrollId}/update`, payload})
};
