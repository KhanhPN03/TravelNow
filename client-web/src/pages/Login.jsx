import { useState, useContext } from "react";
import "./login.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Context } from "../context/ContextProvider";
import { ToastContainer, toast } from "react-toastify";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(Context);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const notify = (message, status) => {
    if (status === "success") {
      return toast.success(message);
    }
    if (status === "error") {
      return toast.error(message);
    }
    if (status === "warn") {
      return toast.warning(message);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email))
      formErrors.email = "A valid email is required";
    if (!password) formErrors.password = "Password is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/account/login",
          { email, password }
        );

        const { token, user } = response.data;
        const decoded = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("user", user);

        login(token, user);

        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "guide") {
          navigate("/guide/attendance");
        } else if (user.role === "superAdmin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } catch (error) {
        notify(`Wrong email or password. Please try again!`, "error");
      }
    }
  };

  return (
    <section className="dGrid">
      <div className="sidebarWrapper">
        <div className="positionCustom sidebarLogoWrapper">
          <img src="/images/logo_sidebar_loginregister.png" alt="logo" />
        </div>
        <h1 className="positionCustom">
          CREATE <br /> YOUR TRIP
        </h1>
      </div>

      <div className="loginWrapper">
        <h1 className="ffGTBold clrDarkBlue">Login Into Your Account</h1>

        <form onSubmit={handleLogin}>
          <div className="formInput">
            <label htmlFor="email">
              <span className="fs-20 ffGTMedium clrDarkBlue">
                Email Address
              </span>
            </label>
            <div className="input-container">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="Enter Your Email"
                required
              />
              <i className="bx bx-envelope input-icon"></i>
            </div>
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="formInput">
            <label className="dFlex loginPassword" htmlFor="password">
              <span className="fs-20 ffGTMedium clrDarkBlue">Password</span>
              <a
                href="/forgotpassword"
                className="fs-14 ffGTBold clrDarkBlue textUnderline"
              >
                Forgot password?
              </a>
            </label>
            <div className="input-container">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                required
              />
              <i
                className={`bx ${
                  showPassword ? "bx-show" : "bx-hide"
                } input-icon password-toggle`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="fs-14 ffGTBold clrWhite loginButton">
            <span>Login Now</span>
          </button>
        </form>
        <ToastContainer style={{ width: "auto" }} />
      </div>
    </section>
  );
}

export default Login;
