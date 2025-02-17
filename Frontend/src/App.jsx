import { Routes, Route, Link } from "react-router-dom";
import { Provider } from 'react-redux';
import store from "./store";
import Register from "@/components/Register.jsx";
import Login from "@/components/Login.jsx";
import Dashboard from "@/components/dashboard/fundraiserDashboard.jsx";
import Donor from "@/components/Donor.jsx";
import Fundraiser from "@/components/Fundraiser.jsx";
import CauseList from "@/components/CauseList.jsx";
import CauseDetail from "@/components/CauseDetail.jsx";
import CreateCause from "@/components/CreateCause.jsx";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const token = localStorage.getItem("token")
  console.log({token})
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/donor" element={<Donor />} />
            <Route path="/fundraiser/*" element={<Fundraiser />} />
            <Route path="/causes" element={<CauseList />} />
            <Route path="/causes/:id" element={<CauseDetail />} />
            <Route path="/create-cause" element={<CreateCause />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold mb-8">Welcome to Good Deed Hub</h1>
                  <div className="flex gap-4 flex-wrap">
                    {
                      token ? <> 
                      <Link
                      to="/fundraiser"
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                    >
                      Fundraiser Portal
                    </Link>
                    <Link
                      to="/causes"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      View Causes
                    </Link>
                   
                    </>:<><Link
                      to="/register"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                    >
                      Login
                    </Link> </>
                    }
                   
                   
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
