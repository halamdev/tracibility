import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call backend API
    const response = await fetch("http://localhost:8090/api/users/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_name", JSON.stringify(data.user_name));
      navigate("/home"); // Chuyển hướng sau khi đăng nhập
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-center">Đăng nhập</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <Input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
