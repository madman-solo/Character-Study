import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, skipLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login(formData.name, formData.password);
        navigate("/");
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("两次输入的密码不一致");
          return;
        }
        await register(formData.name, formData.password);
        // 注册成功后切换到登录模式
        setIsLogin(true);
        setFormData({ name: "", password: "", confirmPassword: "" });
        setError("注册成功！请登录");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败，请重试");
    }
  };

  const handleSkip = () => {
    skipLogin();
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">{isLogin ? "登录" : "注册"}</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">用户名</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入用户名"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="请输入密码"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="请再次输入密码"
                  required={!isLogin}
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button">
              {isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="form-footer">
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "还没有账号？去注册" : "已有账号？去登录"}
            </button>

            <button type="button" className="skip-button" onClick={handleSkip}>
              跳过登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
