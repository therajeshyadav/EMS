import React from "react";
import { setLocalStorage } from "../../utils/localStorage";

const Header = (props) => {
  const logOutUser = () => {
    localStorage.setItem("loggedInUser", "");
    props.changeUser("");
    // window.location.reload();
  };
  const userName =
    props.data?.firstName ||
    JSON.parse(localStorage.getItem("admin"))?.[0]?.firstName ||
    "Guest";

  return (
    <div className="flex items-end justify-between">
      <h1 className="text-2xl font-medium">
        Hello <br />
        <span className="text-3xl font-semibold"> {userName} 👋</span>
      </h1>
      <button
        onClick={logOutUser}
        className="bg-red-500 font-medium text-lg text-white px-5 py-2 rounded-sm"
      >
        Log Out
      </button>
    </div>
  );
};

export default Header;
