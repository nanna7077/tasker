import { useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function ViewTask() {
    const taskID = window.location.href.split("/").at(-1).split("?")[0];
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueAt, setDueAt] = useState("");
    const [due_at_time, setDueAtTime] = useState("00:00");
    const [status, setStatus] = useState(-2);
    const [createdAt, setCreatedAt] = useState("");

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/tasks/view/" + taskID, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                id: taskID
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            setTitle(data.task.title);
            setDescription(data.task.description);
            setDueAt(data.task.due_at.split(" ")[0]);
            setDueAtTime(data.task.due_at.split(" ")[1]);
            setStatus(data.task.status);
            setCreatedAt(data.task.created_at);
        });
    }, []);

    function modifyTask() {
        if (title == "" || dueAt == "" || due_at_time == "" || description == "") {
            toast("Please fill in all required fields!", {
                type: "error",
            });
            return;
        }
        fetch(import.meta.env.VITE_BACKEND_URL + "/tasks/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                id: taskID,
                title: title,
                description: description,
                due_at: `${dueAt} ${due_at_time}`,
                status: status
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
                toast("Task updated!", {
                    type: "success",
                });
                window.location.href = "/";
            });
    }

    function deleteTask() {
        fetch(import.meta.env.VITE_BACKEND_URL + "/tasks/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                id: taskID
            })
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
            toast("Task deleted!", {
                type: "success",
            });
            window.location.href = "/";
        })
    }

    return (
        <div className="h-[80vh] w-screen flex flex-col justify-center items-center">
            <div className="text-xl font-bold">Task View</div>

            <div className="mt-12">
                
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Task Name</span>
                    </div>
                    <input type="text" className="input input-bordered w-full max-w-xs" onChange={(e) => setTitle(e.target.value)} defaultValue={title} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Description</span>
                    </div>
                    <input type="text" className="input input-bordered w-full max-w-xs" onChange={(e) => setDescription(e.target.value)} defaultValue={description} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Deadline</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="date" className="input input-bordered w-full max-w-xs" onChange={(e) => setDueAt(e.target.value)} defaultValue={dueAt} />
                        <input type="time" className="input input-bordered w-full max-w-xs" onChange={(e) => setDueAtTime(e.target.value)} defaultValue={due_at_time} />
                    </div>
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Status</span>
                    </div>
                    <select className="select w-full max-w-xs" value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                        <option value={-2} disabled={([0, 1, 2, -1].includes(status))}>Select Status</option>
                        <option value={0}>Not Started</option>
                        <option value={1}>In Progress</option>
                        <option value={2}>Completed</option>
                        <option value={-1}>Discarded</option>
                    </select>
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Created On</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="date" className="input input-bordered w-full max-w-xs" defaultValue={createdAt.split(" ")[0]} disabled={true} />
                        <input type="time" className="input input-bordered w-full max-w-xs" defaultValue={createdAt.split(" ")[1]} disabled={true} />
                    </div>
                </label>

                <div className="flex gap-2">
                    <button className="btn btn-success mt-4" onClick={() => modifyTask()}>Update Task</button>
                    <button className="btn btn-warning mt-4" onClick={() => window.location.href = "/"}>Cancel</button>
                    <button className="btn btn-error mt-4" onClick={() => deleteTask()}>Delete Task</button>
                </div>


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