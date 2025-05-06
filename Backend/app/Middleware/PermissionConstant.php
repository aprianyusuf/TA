<?php

namespace App\Middleware;

enum PermissionConstant: string {
    case MENU_ORGANIZATION = "SYS00001|menu_organization|1|system";
    case SHOW_ORGANIZATION = "SYS00002|show_organization|1|system";
    case ADD_ORGANIZATION = "SYS00003|add_organization|1|system";
    case EDIT_ORGANIZATION = "SYS00004|edit_organization|1|system";
    case DELETE_ORGANIZATION = "SYS00005|delete_organization|1|system";

    case VIEW_ORGANIZATION_PERMISSION = "MD00000|menu_view_organization_permission|2|master_data";
    case MENU_EMPLOYEE = "MD00001|menu_employee|2|master_data";
    case SHOW_EMPLOYEE = "MD00002|show_employee|2|master_data";
    case ADD_EMPLOYEE = "MD00003|add_employee|2|master_data";
    case EDIT_EMPLOYEE = "MD00004|edit_employee|2|master_data";
    case DELETE_EMPLOYEE = "MD00005|delete_employee|2|master_data";

    case MENU_POSITION = "MD00006|menu_position|2|master_data";
    case SHOW_POSITION = "MD00007|show_position|2|master_data";
    case ADD_POSITION = "MD00008|add_position|2|master_data";
    case EDIT_POSITION = "MD00009|edit_position|2|master_data";
    case DELETE_POSITION = "MD00010|delete_position|2|master_data";

    case MENU_CLIENT = "MD00011|menu_client|3|project_management";
    case SHOW_CLIENT = "MD00012|show_client|3|project_management";
    case ADD_CLIENT = "MD00013|add_client|3|project_management";
    case EDIT_CLIENT = "MD00014|edit_client|3|project_management";
    case DELETE_CLIENT = "MD00015|delete_client|3|project_management";

    case MENU_LEAVE_REQUEST = "MD00016|menu_leave_request|4|leave";
    case SHOW_LEAVE_REQUEST = "MD00017|show_leave_request|4|leave";
    case ADD_LEAVE_REQUEST = "MD00018|add_leave_request|4|leave";
    case RESPONSE_LEAVE_REQUEST = "MD00019|response_leave_request|4|leave";
    case EDIT_LEAVE_REQUEST = "MD00020|edit_leave_request|4|leave";
    case ABORT_LEAVE_REQUEST = "MD00021|abort_leave_request|4|leave";

    case MENU_PAYROLL_PERIOD = "MD00022|menu_payroll_period|5|payroll";
    case SHOW_PAYROLL_PERIOD = "MD00023|show_payroll_period|5|payroll";
    case ADD_PAYROLL_PERIOD = "MD00024|add_payroll_period|5|payroll";
    case EDIT_PAYROLL_PERIOD = "MD00025|edit_payroll_period|5|payroll";
    case DELETE_PAYROLL_PERIOD = "MD00026|delete_payroll_period|5|payroll";

    case MENU_PAYROLL = "MD00022|menu_payroll|5|payroll";
    case SHOW_PAYROLL = "MD00023|show_payroll|5|payroll";
    case ADD_PAYROLL = "MD00024|add_payroll|5|payroll";
    case EDIT_PAYROLL = "MD00025|edit_payroll|5|payroll";
    case DELETE_PAYROLL = "MD00026|delete_payroll|5|payroll";

    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function array(): array
    {
        return array_combine(self::values(), self::names());
    }
}
