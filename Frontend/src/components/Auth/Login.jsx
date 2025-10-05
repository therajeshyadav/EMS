import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { AuthApi } from "../../api/api";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/Authprovider";

const Login = ({ setUser, setLoggedInUserData }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get AuthContext to update authState
  const { setAuthState } = useContext(AuthContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await AuthApi.login(email, password);
      console.log("LOGIN RESPONSE:", res);

      if (res?.success) {
        // ✅ Save in localStorage (multiple formats for compatibility)
        localStorage.setItem("token", res.token);
        localStorage.setItem("profile", JSON.stringify(res.profile));
        localStorage.setItem("role", res.user?.role);
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            role: res.user?.role,
            token: res.token,
            user: res.user,
            profile: res.profile,
          })
        );

        // ✅ Update AuthContext state
        setAuthState({
          token: res.token,
          profile: res.profile,
          role: res.user?.role,
        });

        // ✅ Update App.jsx state (for backward compatibility)
        setUser(res.user?.role);
        setLoggedInUserData(res.profile);

        toast.success("Login successful!");

        // ✅ Navigate
        if (res.user?.role === "employee") navigate("/employee");
        else if (res.user?.role === "admin") navigate("/admin");
        else navigate("/");
      } else {
        toast.error(res?.message || "Login failed!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
      console.error("LOGIN ERROR:", err?.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 card-shadow">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80">Sign in to your EMS account</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-indigo-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-white/80 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-white font-medium hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
