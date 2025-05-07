import { lazy } from "react";

import ClockInOut from "./pages/Leave/ClockInOut/ClockInOut";
import LeaveRequest from "./pages/Leave/Request/LeaveRequest";
import Salary from "./pages/Payroll/PayrollPeriod/PayrollPeriodShow";

export const ROUTE_MASTER = [
	// {
	// 	Component: lazy(() => import("@/pages/Master/Organization/Organization")),
	// 	path: "organization",
	// 	menu: "SYS00001",
	// 	isLazy: true,
	// 	title: "Organization",
	// 	fullPath: "/master/organization",
	// 	isNavbar: true,
	// },
	// {
	// 	Component: lazy(
	// 		() => import("@/pages/Master/Organization/AddOrganization"),
	// 	),
	// 	path: "organization/add",
	// 	menu: "SYS00003",
	// 	isLazy: true,
	// },
	// {
	// 	Component: lazy(
	// 		() => import("@/pages/Master/Organization/EditOrganization"),
	// 	),
	// 	path: "organization/edit/:id",
	// 	menu: "SYS00004",
	// 	isLazy: true,
	// },
	{
		Component: lazy(() => import("@/pages/Master/Position/Position")),
		path: "position",
		menu: "MD00007",
		isLazy: true,
		title: "Position",
		fullPath: "/master/position",
		isNavbar: true,
	},
	{
		Component: lazy(() => import("@/pages/Master/Position/AddPosition")),
		path: "position/add",
		menu: "MD00008",
		isLazy: true,
	},
	{
		Component: lazy(() => import("@/pages/Master/Position/EditPosition")),
		path: "position/edit/:id",
		menu: "MD00009",
		isLazy: true,
	},
	{
		Component: lazy(() => import("@/pages/Master/Employee/Employee")),
		path: "employee",
		menu: "MD00001",
		isLazy: true,
		title: "Employee",
		fullPath: "/master/employee",
		isNavbar: true,
	},
	{
		Component: lazy(() => import("@/pages/Master/Employee/AddEmployee")),
		path: "employee/add",
		menu: "MD00003",
		isLazy: true,
	},
	{
		Component: lazy(() => import("@/pages/Master/Employee/EditEmployee")),
		path: "employee/edit/:id",
		menu: "MD00004",
		isLazy: true,
	},
];

export const ROUTE_LEAVE = [
	{
		Component: ClockInOut,
		path: "clock-in-out",
		menu: true,
		title: "Clock In/Out",
		fullPath: "/leave/clock-in-out",
		isNavbar: true,
	},
	{
		Component: LeaveRequest,
		path: "leave-request",
		menu: true,
		title: "Leave Request",
		fullPath: "/leave/leave-request",
		isNavbar: true,
	},
];

export const ROUTE_PAYROLL = [
	{
		Component: lazy(() => import("@/pages/Payroll/PayrollPeriod/PayrollPeriod")),
		path: "payrollperiod",
		menu: "MD00022",
		isLazy: true,
		title: "Payroll",
		fullPath: "/payroll/payrollperiod",
		isNavbar: true,
	},
	{
		Component: lazy(() => import("@/pages/Payroll/PayrollPeriod/PayrollPeriodShow")),
		path: "payrollperiod/add",
		menu: "MD00024",
		isLazy: true,
	},
	{
		Component: lazy(() => import("@/pages/Payroll/PayrollPeriod/PayrollPeriodShow")),
		path: "payrollperiod/:id",
		menu: "MD00023",
		isLazy: true,
	},
	{
		Component: lazy(() => import("@/pages/Payroll/PayrollPeriod/PayrollShow")),
		path: "payrollperiod/edit/:id",
		menu: "MD00025",
		isLazy: true,
	},
];

export const ROUTE_PROJECT_MANAGEMENT = [
	{
		Component: lazy(() => import("@/pages/ProjectManagement/Client/Client")),
		path: "client",
		menu: "MD00011",
		isLazy: true,
		title: "Client",
		fullPath: "/project-management/client",
		isNavbar: true,
	},
	{
		Component: lazy(() => import("@/pages/ProjectManagement/Client/AddClient")),
		path: "client/add",
		menu: "MD00013",
		isLazy: true,
	},
	{
		Component: lazy(
			() => import("@/pages/ProjectManagement/Client/EditClient"),
		),
		path: "client/edit/:id",
		menu: "MD00014",
		isLazy: true,
	},
	{
		Component: lazy(
			() => import("@/pages/ProjectManagement/ClientProject/ClientProject"),
		),
		path: "client/:client/projects",
		menu: "MD00014",
		isLazy: true,
	},
	{
		Component: lazy(
			() => import("@/pages/ProjectManagement/ClientProject/AddClientProject"),
		),
		path: "client/:client/projects/add",
		menu: "MD00014",
		isLazy: true,
	},
	{
		Component: lazy(
			() => import("@/pages/ProjectManagement/ClientProject/EditClientProject"),
		),
		path: "client/:client/projects/edit/:id",
		menu: "MD00014",
		isLazy: true,
	},
	{
		Component: lazy(
			() =>
				import("@/pages/ProjectManagement/ClientProjectUser/ClientProjectUser"),
		),
		path: "client/:client/projects/:id/users",
		menu: true,
		isLazy: true,
	},
	{
		Component: lazy(
			() =>
				import(
					"@/pages/ProjectManagement/ClientProjectUser/AddClientProjectUser"
				),
		),
		path: "client/:client/projects/:id/users/add",
		menu: true,
		isLazy: true,
	},
	{
		Component: lazy(
			() =>
				import(
					"@/pages/ProjectManagement/ClientProjectUser/EditClientProjectUser"
				),
		),
		path: "client/:client/projects/:project/users/edit/:id",
		menu: true,
		isLazy: true,
	},
];

export const ROUTE_PROJECT = [
	{
		Component: lazy(() => import("@/pages/Project/(project)/$projectId")),
		path: ":projectId",
		menu: true,
		isLazy: true,
	},
];

export const ROUTE_TIMESHEET = [
	{
		Component: lazy(
			() => import("@/pages/Timesheet/MonthlyTimesheet/MonthlyTimesheet"),
		),
		path: "/",
		menu: true,
		isLazy: true,
		title: "Timesheet",
		fullPath: "/timesheet",
		isNavbar: true,
	},
];
