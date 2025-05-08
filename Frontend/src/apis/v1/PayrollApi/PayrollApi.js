import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
    // getAll: (params) => GET({ path: `/payroll`, params }),
    getPayrollsByPeriod: ({ id, ...params }) =>
        GET({ path: `/payroll_period/${id}/payrolls`, params }),
    // show: (params) => GET({ path: `/payroll_period/${id}/payrolls`, params }),
    showDetailPeriod: ({ id, periodId, ...params }) => GET({ path: `/payroll_period/${id}/payrolls/${periodId}`, params }),
    update: ({ id, ...payload }) => POST({ path: `/payroll/payrolls/update/${id}`, payload })
};
