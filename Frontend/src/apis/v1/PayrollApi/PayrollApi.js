import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
    // getAll: (params) => GET({ path: `/payroll`, params }),
    getPayrollsByPeriod: ({ id, ...payload }) =>
        GET({ path: `/payroll_period/${id}/payrolls`, payload }),
};
