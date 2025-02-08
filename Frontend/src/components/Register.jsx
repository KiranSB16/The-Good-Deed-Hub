import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { registerUser } from "../slices/userSlice";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const dispatch = useDispatch();
  //const navigate = useNavigate();
  const { serverErrors } = useSelector((state) => state.users);
  const [errors, setErrors] = useState({});

  
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is Required"),
    email: Yup.string().email("Invalid format").required("Email is Required"),
    password: Yup.string()
      .min(8, "Password must be minimum 8 characters long")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one symbol"
      )
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .required("Password is Required"),
    role: Yup.string().required("Role is required"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      dispatch(registerUser({ formData, resetForm }));
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
      name: "",
      email: "",
      password: "",
      role: "",
    });
  };

  return (
    <>
      <h1>Registration</h1>
      {serverErrors?.length > 0 && (
        <div style={{ color: "red" }}>
          <h3>Server errors</h3>
          <ul>
            {serverErrors.map((err, i) => (
              <li key={i}>{err.msg}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <div className="error" style={{ color: "red" }}>
              {errors.name}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <div className="error" style={{ color: "red" }}>
              {errors.email}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="error" style={{ color: "red" }}>
              {errors.password}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="donor">
            <input
              type="radio"
              value="donor"
              onChange={handleChange}
              checked={formData.role === "donor"}
              id="donor"
              name="role"
            />
            Donor
          </label>
          <label htmlFor="fundraiser">
            <input
              type="radio"
              value="fundraiser"
              onChange={handleChange}
              checked={formData.role === "fundraiser"}
              id="fundraiser"
              name="role"
            />
            Fundraiser
          </label>
          {errors.role && (
            <div className="error" style={{ color: "red" }}>
              {errors.role}
            </div>
          )}
        </div>

        <button type="submit">Register</button>
      </form>
    </>
  );
}