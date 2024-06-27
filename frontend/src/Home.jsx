import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
    const [user, setUser] = useState(null);
    const [pending, setPending] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [discarded, setDiscarded] = useState([]);
    const [notStarted, setNotStarted] = useState([]);

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/tasks/list", {
            method: "GET",
            headers: new Headers({
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            setPending(data.tasks.inprogress.pending);
            setOverdue(data.tasks.inprogress.overdue);
            setCompleted(data.tasks.completed);
            setDiscarded(data.tasks.discarded);
            setNotStarted(data.tasks.notstarted);
        });
    }, [user]);

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/user/self", {
            method: "GET",
            headers: new Headers({
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                window.location.href = "/login";
                return;
            }
            setUser(data.user);
        });
    }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const sourceList = getSourceList(source.droppableId);
        const destinationList = getDestinationList(destination.droppableId);

        const [removed] = sourceList.splice(source.index, 1);
        destinationList.splice(destination.index, 0, removed);

        setLists(source.droppableId, sourceList);
        setLists(destination.droppableId, destinationList);

        // Update the task status in the backend
        updateTaskStatus(removed.id, destination.droppableId);
    };

    const getSourceList = (id) => {
        switch (id) {
            case "pending": return pending;
            case "overdue": return overdue;
            case "completed": return completed;
            case "discarded": return discarded;
            case "notStarted": return notStarted;
            default: return [];
        }
    };

    const getDestinationList = (id) => {
        switch (id) {
            case "pending": return pending;
            case "overdue": return overdue;
            case "completed": return completed;
            case "discarded": return discarded;
            case "notStarted": return notStarted;
            default: return [];
        }
    };

    const setLists = (id, list) => {
        switch (id) {
            case "pending": setPending([...list]); break;
            case "overdue": setOverdue([...list]); break;
            case "completed": setCompleted([...list]); break;
            case "discarded": setDiscarded([...list]); break;
            case "notStarted": setNotStarted([...list]); break;
            default: break;
        }
    };

    const updateTaskStatus = (taskId, status) => {
        const statusMap = {
            "pending": 1,
            "completed": 2,
            "discarded": -1,
            "notStarted": 0
        }
        if (status == "overdue") {
            toast.error("Task cannot be marked as overdue. Overdue tasks are automatically filtered. Mark as pending instead and will auto-move to overdue when due date is reached.");
            setTimeout(() => {
                window.location.reload();
            }, 5000);
            return;
        }
        status = statusMap[status];

        fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authentication": `${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ "id": taskId, "status": status }),
        }).then(response => response.json())
        .then(data => {
            if (data.error) {
                toast.error(data.error);
                return;
            }
            toast.success("Task status updated!");
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="m-16">
                <TaskSection title="Overdue" tasks={overdue} droppableId="overdue" />
                <TaskSection title="Pending" tasks={pending} droppableId="pending" />
                <TaskSection title="Not Started" tasks={notStarted} droppableId="notStarted" />
                <TaskSection title="Completed" tasks={completed} droppableId="completed" />
                <TaskSection title="Discarded" tasks={discarded} droppableId="discarded" />
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
        </DragDropContext>
    );
}

const TaskSection = ({ title, tasks, droppableId }) => {
    return (
        <div>
            <div className="text-lg font-bold">{title}</div>
            <Droppable droppableId={droppableId}>
                {(provided) => (
                    <div
                        className="flex gap-6 mb-12 mt-4 flex-wrap"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        className={`w-full md:w-1/6 bg-slate-50 border-black border-2 p-4 rounded ${snapshot.isDragging ? "bg-blue-50" : ""}`}
                                        onClick={() => { window.location.href = `/task/${task.id}` }}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <div className="font-bold">{task.title}</div>
                                        <div>{task.due_at}</div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
