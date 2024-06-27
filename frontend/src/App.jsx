import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import NavBar from "./Navbar";
import Login from "./Login";
import Register from "./Register";
import AddTask from "./AddTask";
import ViewTask from "./ViewTask";

function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <div className="m-3 md:mt-20">
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/addtask" element={<AddTask />} />
                    <Route path="/task/:taskID" element={<ViewTask />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;