import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
    // getAll: (params) => GET({ path: `/payroll`, params }),
    getPayrollsByPeriod: ({ id, ...payload }) =>
        GET({ path: `/payroll_period/${id}/payrolls`, payload }),
    show: (params) => GET({ path: `/payroll_period/${id}/payrolls`, params }),
    showDetailPeriod: ({ id, periodId }) => GET({ path: `/payroll_period/${id}/payrolls/${periodId}` }),
    update: ({ id, ...payload }) => POST({ path: `/payroll/payrolls/update/${id}`, payload })
};
