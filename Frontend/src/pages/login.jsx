import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
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
    "https://task-manager-za8c.onrender.com/api/auth/login",
    formData
  );

  localStorage.setItem("token", response.data.token);

  navigate("/dashboard");
} catch (error) {
  alert(error.response?.data?.message || "Login Failed");
}


};

return ( <div className="login-container"> <div className="login-card"> <h1>Login</h1>


    <form onSubmit={handleSubmit}>
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
        Login
      </button>
    </form>

    <Link className="login-link" to="/register">
      Don't have an account? Register
    </Link>
  </div>
</div>


);
}

export default Login;
