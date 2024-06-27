import { useState } from "react"
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AddTask() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueAt, setDueAt] = useState("");
    const [due_at_time, setDueAtTime] = useState("00:00");

    function addTask() {
        console.log(title, description, due_at_time);
        if (title == "" || dueAt == "" || due_at_time == "") {
            toast("Please fill in all required fields!", {
                type: "error",
            });
            return;
        }
        fetch(import.meta.env.VITE_BACKEND_URL + "/tasks/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                title: title,
                description: description,
                due_at: `${dueAt} ${due_at_time}`,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error(data.error);
                    toast(data.error, {
                        type: "error",
                    });
                    return;
                }
                toast("Task added!", {
                    type: "success",
                });
                window.location.href = "/";
            });
    }

    return (
        <div className="h-[50vh] w-screen flex flex-col justify-center items-center">
            <div className="text-xl font-bold">Add New Task</div>

            <div className="mt-12">
                
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Task Name</span>
                    </div>
                    <input type="text" className="input input-bordered w-full max-w-xs" onChange={(e) => setTitle(e.target.value)} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Description</span>
                    </div>
                    <input type="text" className="input input-bordered w-full max-w-xs" onChange={(e) => setDescription(e.target.value)} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Deadline</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="date" className="input input-bordered w-full max-w-xs" onChange={(e) => setDueAt(e.target.value)} />
                        <input type="time" className="input input-bordered w-full max-w-xs" onChange={(e) => setDueAtTime(e.target.value)} defaultValue={due_at_time} />
                    </div>
                </label>

                <button className="btn mt-4" onClick={() => addTask()}>Add Task</button>

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
    )
}