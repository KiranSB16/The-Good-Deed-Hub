import { useState } from "react";
import {useNavigate} from "react-router-dom"
import { useDispatch , useSelector } from "react-redux";
import * as Yup from "yup";
import { loginUser } from "../slices/userSlice";
export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
      });
      const navigate = useNavigate()
      const dispatch = useDispatch()
      const {data , serverErrors} = useSelector((state) => {
        return state.users
      })
    
      const [errors, setErrors] = useState({}) 
      const validationSchema = Yup.object({
        email: Yup.string()
          .email("Invalid format")
          .required("Email is Required"),
        password: Yup.string()
          .min(8, "Password must be minimum 8 characters long")
          .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain at least one symbol"
          )
          .matches(/[0-9]/, "Password must contain at least one number")
          .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
          .matches(/[a-z]/, "Password must contain at least one lowercase letter")
          .required("Password is Required")
      });
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await validationSchema.validate(formData, { abortEarly: false });
          console.log("Form Submitted", formData);
          dispatch(loginUser({formData , resetForm}))
        } catch (error) {
          const newErrors = {};
          error.inner.forEach((err) => {
            newErrors[err.path] = err.message;
          });
          setErrors(newErrors);
        }
      };
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };

      const resetForm = () => {
        setFormData({
          email : "",
          password: ""
        })
        navigate("/dashboard")
      }
    
    return (
    <>
        <h1>Login</h1>
        {serverErrors?.length > 0 && (
      <div style={{ color: "red" }}>
        <h3>Server Errors:</h3>
        <ul>
          {serverErrors.map((err, i) => (
            <li key={i}>{err.msg}</li>
          ))}
        </ul>
      </div>
    )}
        <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error" style={{color : "red"}}>{errors.email}</div>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <div className="error" style={{color : "red"}}>{errors.password}</div>}
        </div>
        <button type="submit">login</button>
        </form>
    </>
    )
}
    