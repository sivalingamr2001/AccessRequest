import { message } from "antd";
import { useState } from "react";
import { userApi } from "../api/userApi";
import type { UserDetailsDto } from "../types";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserDetailsDto | null>(() => {
    try {
      const saved = localStorage.getItem("fsfa_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = async (
    values: any,
    onLoggedIn: (user: UserDetailsDto) => void,
  ) => {
    try {
      const user = await userApi.login(values.username, values.password);
      localStorage.setItem("fsfa_user", JSON.stringify(user));
      setCurrentUser(user);
      onLoggedIn(user);
      message.success(`Logged in successfully as ${user.userName}`);
    } catch (err: any) {
      message.error(err.message || "Login failed");
    }
  };

  const handleLogout = (onLoggedOut: () => void) => {
    localStorage.removeItem("fsfa_user");
    localStorage.removeItem("fsfa_active_view");
    setCurrentUser(null);
    onLoggedOut();
    message.info("Logged out successfully");
  };

  return { currentUser, setCurrentUser, handleLogin, handleLogout };
}
