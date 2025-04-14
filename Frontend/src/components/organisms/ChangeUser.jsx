import React, { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import AuthApi from "@/apis/v1/AuthApi";
import EmployeeApi from "@/apis/v1/MasterApi/EmployeeApi";
import { ENABLE_CHANGE_USER_PASSWORD } from "@/configs/env";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import HookFormProvider from "@/providers/HookFormProvider";
import { useBoundLocalStore, useBoundStore } from "@/stores";

import { Spinner } from "../atoms/Spinner";
import InputControl from "../moleculs/Control/InputControl";
import { Button } from "../ui/Button";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/Command";
import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";

const ChangeUser = () => {
	const queryClient = useQueryClient();
	const { login, user } = useBoundStore((state) => state);
	const setTimesheetStore = useBoundLocalStore(
		(state) => state.setTimesheetStore,
	);

	const [dialogState, setDialogState] = useState({
		isOpen: false,
		user: null,
	});

	const { data, isLoadingGetUser } = useCustomQuery({
		api: EmployeeApi.getAll,
		queryKey: "employees",
	});

	const { onSubmit, isLoading } = useCustomMutation({
		api: AuthApi.changeUser,
		onSuccess: (res) => {
			setTimesheetStore("selectedAs", "My Self");
			queryClient.clear();
			login(res.data);
			setDialogState({
				isOpen: false,
				user: null,
			});
		},
		onError: (res) => {
			toast.error(res.message);
		},
	});

	const handleDialog = (open) => () => {
		setDialogState((state) => ({
			...state,
			isOpen: open,
		}));
	};

	return (
		<>
			<Command>
				{isLoadingGetUser ? (
					<div className="flex h-32 w-44 items-center justify-center">
						<Spinner />
					</div>
				) : (
					<CommandList>
						<CommandGroup>
							{data?.data
								?.filter((i) => i.id !== user.id)
								?.map((user, id) => (
									<CommandItem
										key={id}
										value={user}
										onSelect={() => {
											setDialogState({
												isOpen: true,
												user: user,
											});
										}}
									>
										{user.firstName.concat(" ").concat(user.lastName)} (
										{user.position})
									</CommandItem>
								))}
						</CommandGroup>
					</CommandList>
				)}
			</Command>
			<Dialog
				open={dialogState.isOpen}
				onOpenChange={(open) => handleDialog(open)()}
			>
				<DialogContent>
					<DialogTitle>Change User</DialogTitle>
					<HookFormProvider
						defaultValues={{
							id: dialogState.user?.id,
							password: ENABLE_CHANGE_USER_PASSWORD,
						}}
						className="flex flex-col gap-2"
						onSubmit={onSubmit}
					>
						<InputControl
							label="User"
							name="User"
							placeholder={dialogState.user?.firstName
								?.concat(" ")
								?.concat(dialogState.user?.lastName)}
							isDisabled
						/>
						<InputControl
							label="Password"
							name="password"
							placeholder="Password"
							type="password"
						/>
						<Button>{isLoading ? <Spinner /> : "Change user"}</Button>
					</HookFormProvider>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ChangeUser;
