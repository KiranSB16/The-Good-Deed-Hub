import { Routes, Route, Link } from "react-router-dom";
import { Provider } from 'react-redux';
import store from "./store";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Register from "@/components/Register.jsx";
import Login from "@/components/Login.jsx";
import FundraiserDashboard from "@/components/fundraiser/FundraiserDashboard.jsx";
import Donor from "@/components/Donor.jsx";
import CauseList from "@/components/CauseList.jsx";
import CauseDetail from "@/components/CauseDetail.jsx";
import CreateCause from "@/components/CreateCause.jsx";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/fundraiser/dashboard" element={<FundraiserDashboard />} />
            <Route path="/donor" element={<Donor />} />
            <Route path="/causes" element={<CauseList />} />
            <Route path="/causes/:id" element={<CauseDetail />} />
            <Route path="/cause/create" element={<CreateCause />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
