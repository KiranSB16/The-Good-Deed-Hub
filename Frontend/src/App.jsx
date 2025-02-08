import { Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
// import Account from "./components/Account.jsx";
// import Dashboard from "./components/dashboard.jsx";

function App() {
  return (
      <div>
        <h1>User Auth Setup</h1>
        <nav>
          <ul>
            {/* <li><Link to="/account">Account</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li> */}
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/account" element={<Account />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </div>
  );
}

export default App;
