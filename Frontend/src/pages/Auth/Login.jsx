import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import AuthApi from "@/apis/v1/AuthApi";
import { Spinner } from "@/components/atoms/Spinner";
import InputControl from "@/components/moleculs/Control/InputControl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EMAIL, PASSWORD } from "@/configs/env";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { AuthLoginRequest } from "@/schema/request/AuthRequest";
import { useBoundStore } from "@/stores";
import logo from '@/assets/logo_msp.png';


const Login = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { login, user, token } = useBoundStore((state) => state);

	const { onSubmit, isLoading: isSubmitLogin } = useCustomMutation({
		api: AuthApi.login,
		invalidateQueries: [],
		onSuccess: (res) => {
			queryClient.clear();
			login(res.data);
			navigate("/master/employee", { replace: true });
		},
		onError: (res) => {
			toast.error(res.message);
		},
	});

	useEffect(() => {
		if (user && token) {
			navigate("/leave/leave-request", { replace: true });
		}
	}, [user]);

	const onSubmitLogin = (data, e) => {
		const payload = {
			email: data.email,
			password: data.password,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		};

		onSubmit(payload, e);
	};

	return (
		<div className="flex h-dvh w-full flex-col">
			<div className="flex h-full w-full grow place-content-center items-center justify-center">
				<Card className="m-3 mx-auto w-full py-4 shadow-lg md:w-[60%] md:p-3 lg:w-[40%]">
					<CardContent>
						<HookFormProvider
							defaultValues={{
								email: import.meta.env.DEV ? EMAIL : "",
								password: import.meta.env.DEV ? PASSWORD : "",
							}}
							schema={AuthLoginRequest}
							className="flex flex-col gap-4"
							onSubmit={onSubmitLogin}
						>
							<img
								src={logo}
								alt="logo-msp"
								className="w-80 object-contain mx-auto"
							/>
							<h2 className="text-xl font-bold text-center">Selamat Datang, Silahkan Login !</h2>
							<InputControl
								label="Email"
								name="email"
								type="email"
								placeholder="Email"
							/>
							<InputControl
								label="Password"
								name="password"
								placeholder="Password"
								type="password"
							/>
							<Button>{isSubmitLogin ? <Spinner /> : "Login"}</Button>
						</HookFormProvider>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Login;
