import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "https://task-manager-za8c.onrender.com/api/auth/register",
                formData
            );

            alert(response.data.message);

            navigate("/");
        } catch (error) {
            alert(error.response?.data?.message || "Registration Failed");
        }
    };

    return ( <div className="login-container"> <div className="login-card"> <h1>Register</h1>

        <form onSubmit={handleSubmit}>
            <input
                className="login-input"
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
            />

            <input
                className="login-input"
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
            />

            <input
                className="login-input"
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
            />

            <button className="login-btn" type="submit">
                Create Account
            </button>
        </form>

        <Link className="login-link" to="/">
            Already have an account? Login
        </Link>
    </div>
</div>
);
}

export default Register;