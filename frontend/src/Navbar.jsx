import React, { useState, useEffect } from "react";
import "./Navbar.css";

export default function NavBar() {
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        fetch(import.meta.env.VITE_BACKEND_URL + "/user/self", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            headers: new Headers({
                "Authentication": `${window.localStorage.getItem("token")}`,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            setUser(data.user);
        });
    }, []);

    return (
        <nav className={isMobile ? "tab-bar" : "navbar"}>
            <div className="text-xl font-bold secondary">
                Tasker
            </div>
            <div className="nav-items">
                {!user && <a href="/login">Login</a>}
                {!user && <a href="/register">Register</a>}
                {user && <a>Hello, {user.username}</a>}
                {user && <a className="pointer-cursor" onClick={() => {window.localStorage.removeItem("token"); window.location.href = "/"}}>Logout</a>}
                {user && <button onClick={() => window.location.href = "/addtask"} className="btn bg-secondary-content">Add Task</button>}
            </div>
        </nav>
    );
};
