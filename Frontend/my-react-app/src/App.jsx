import './App.css'
import {Link , Routes , Route} from "react-router-dom"
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Account from './components/Account.jsx'
import Dashboard from './components/dashboard.jsx'
import { useSelector } from 'react-redux'
function App() {
  const {isLoggedIn} = useSelector(state => state.users)
  return (
    <>
     <h1>User Auth Setup</h1>
     <ul>
      { isLoggedIn ? (
      <>
        <li><Link to="/account">Account</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </>
      ) : (
      <>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
      </>
      )}

      <Routes>
        <Route path ="/register" element = {<Register />}/>
        <Route path ="/login" element = {<Login />}/>
        <Route path ="/account" element = {<Account />}/>
        <Route path = "/dashboard" element = {<Dashboard />} />

      </Routes>
     </ul>
    
        
    </>
  )
}
export default App
