import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
    getAll: (params) => GET({ path: `/payroll_period`, params }),
    createPayrollPeriod: (payload) => POST({ path: '/payroll_period/create', payload }),
    show: ({ id, ...payload }) =>
        PUT({ path: `/payroll_period/${id}`, payload }),
    delete: ({ id, ...payload }) =>
        DELETE({ path: `/payroll_period/${id}`, payload })
};
