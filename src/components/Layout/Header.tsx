import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, Home, Search, Plus, Settings, LogOut, LogIn } from "lucide-react";
import { WalletConnection } from "../WalletConnection";
import { NetworkInfo } from "../NetworkInfo";
import { useContractContext } from "../../contexts/ContractContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    walletState,
    loading,
    connectWallet,
    disconnectWallet,
  } = useContractContext();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]); // cập nhật khi route thay đổi

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Trang chủ", icon: Home },
    { path: "/search", label: "Tra cứu", icon: Search },
    ...(isLoggedIn
      ? [
          { path: "/create", label: "Tạo sản phẩm", icon: Plus },
          { path: "/admin", label: "Quản lý", icon: Settings },
        ]
      : []),
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Traceability
            </span>
          </Link>

          {/* Navigation + Actions */}
          <div className="hidden md:flex flex-1 items-center justify-between">
            {/* Bên trái: nav */}
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bên phải: login / logout + ví */}
            <div className="flex items-center space-x-4 pr-2">
              {isLoggedIn && walletState && (
                <>
                  {walletState.isConnected && <NetworkInfo />}
                  <WalletConnection
                    walletState={walletState}
                    onConnect={connectWallet}
                    onDisconnect={disconnectWallet}
                    loading={loading}
                  />
                </>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100">
          <nav className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
