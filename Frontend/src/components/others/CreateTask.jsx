import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/Authprovider";

const CreateTask = () => {
  const [userData, setUserData] = useContext(AuthContext);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskdate, setTaskDate] = useState("");
  const [assignto, setAssignTo] = useState("");
  const [category, setCategory] = useState("");

  const [newtask, setNewTask] = useState({});

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("Hello");
    const newTask = {
      taskTitle,
      taskDescription,
      taskdate,
      category,
      active: false,
      newTask: true,
      failed: false,
      completed: false,
    };

    const updatedEmployees = userData.employees.map((employee) => {
      if (employee.firstName === assignto) {
        return {
          ...employee,
          tasks: [...(employee.tasks || []), newTask],
        };
      }
      return employee;
    });

    // const data = JSON.parse(localStorage.getItem("employees"));
    // data.forEach(function (e) {
    //   console.log(e.firstName);
    //   if (e.firstName === assignto) {
    //     e.tasks.push(newTask);
    //   }
    // });

    setUserData({ ...userData, employees: updatedEmployees });
    console.log(updatedEmployees);
    // Reset form fields
    setTaskDate("");
    setTaskDescription("");
    setTaskTitle("");
    setAssignTo("");
    setCategory("");
  };

  return (
    <div className="p-5 bg-[#1c1c1c] mt-5 rounded">
      <form
        onSubmit={(e) => {
          submitHandler(e);
        }}
        className="flex flex-wrap w-full  items-start justify-between"
      >
        <div className="w-1/2">
          <div>
            <h3 className="text-sm text-gray-300 mb-0.5">Task Title</h3>
            <input
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
              }}
              className="text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4 "
              type="text"
              placeholder="Make a UI Design"
            />
          </div>
          <div>
            <h3 className="text-sm text-gray-300 mb-0.5">Date</h3>
            <input
              value={taskdate}
              onChange={(e) => {
                setTaskDate(e.target.value);
              }}
              className="text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4 "
              type="date"
            />
          </div>
          <div>
            <h3 className="text-sm text-gray-300 mb-0.5">Asign to</h3>
            <input
              value={assignto}
              onChange={(e) => {
                setAssignTo(e.target.value);
              }}
              className="text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4 "
              type="text"
              placeholder="Employee Name"
            />
          </div>
          <div>
            <h3 className="text-sm text-gray-300 mb-0.5">Category</h3>
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              className="text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4 "
              type="text"
              placeholder="design, dev etc"
            />
          </div>
        </div>

        <div className="w-2/5 flex flex-col items-start ">
          <h3 className="text-sm text-gray-300 mb-0.5">Task Description</h3>
          <textarea
            value={taskDescription}
            onChange={(e) => {
              setTaskDescription(e.target.value);
            }}
            className="w-full h-44 text-sm py-2 px-4 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4 "
            name=""
            id=""
            cols="30"
            rows="10"
          ></textarea>
          <button className="bg-emerald-500 py-3 hover:bg-emerald-600 px-5 rounded text-sm mt-4 w-full">
            Create TAsk
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
