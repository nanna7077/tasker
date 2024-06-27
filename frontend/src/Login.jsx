import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/user/self", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authentication: `${window.localStorage.getItem("token")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                window.location.href = "/";
            });
    }, []);

    function login() {
        fetch(import.meta.env.VITE_BACKEND_URL + "/user/login", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                password: password,
            })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    toast(data.error, {
                        type: "error",
                    });
                    return;
                }
                window.localStorage.setItem("token", data.session);
                toast("You are now logged in!", {
                    type: "success",
                });
                window.location.href = "/";
            });
    }

    return (
        <div>
            <div className="flex flex-col gap-4 justify-center items-center h-[80vh] w-screen">
                <div className="text-2xl font-bold">Login to Tasker</div>
                <label className="input input-bordered flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4 opacity-70"
                    >
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                    </svg>
                    <input
                        type="text"
                        className="grow"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <label className="input input-bordered flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4 opacity-70"
                    >
                        <path
                            fillRule="evenodd"
                            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <input
                        type="password"
                        className="grow"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button className="btn w-[20vw]" onClick={login}>Login</button>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}
