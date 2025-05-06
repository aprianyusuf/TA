import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
    getAll: (params) => GET({ path: `/payroll`, params }),
};
