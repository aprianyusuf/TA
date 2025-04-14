import React from "react";

import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import Login from "@/pages/Auth/Login";
import Leave from "@/pages/Leave/Leave";
import Master from "@/pages/Master/Master";
import Project from "@/pages/Project/Project";
import ProjectManagement from "@/pages/ProjectManagement/ProjectManagement";
import Timesheet from "@/pages/Timesheet/Timesheet";
import Template from "@/templates/Template";

function App() {
	return (
		<>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<Template />}>
					<Route path="/master/*" element={<Master />} />
					<Route path="/leave/*" element={<Leave />} />
					<Route path="/timesheet/*" element={<Timesheet />} />
					<Route path="/project-management/*" element={<ProjectManagement />} />
					<Route path="/projects/*" element={<Project />} />
					<Route path="*" element={<Navigate to={"/"} />} />
				</Route>
			</Routes>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</>
	);
}

export default App;
