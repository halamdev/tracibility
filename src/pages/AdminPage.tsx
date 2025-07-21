import React, { useEffect, useState } from 'react';
import { AdminPanel } from '../components';
import { toast } from 'react-toastify';
import { useContractContext } from '../contexts/ContractContext';

export const AdminPage: React.FC = () => {
  const {
    walletState,
    loading,
    error,
    authorizeUser,
    revokeUser,
    clearError,
  } = useContractContext();

  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const API_BACKEND = import.meta.env.VITE_API_BACKEND_URL;


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (walletState.isConnected && token) {
      fetchUsers(token);
    }
  }, [walletState.isConnected]);

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch(`${API_BACKEND}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Lỗi khi load danh sách người dùng:', err);
    }
  };

  const handleAuthorize = async (address: string) => {
    const result = await authorizeUser(address);
    if (result) {
      toast.success('Đã cấp quyền thành công!');
    }
  };

  const handleRevoke = async (address: string) => {
    const result = await revokeUser(address);
    if (result) {
      toast.success('Đã thu hồi quyền thành công!');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      const res = await fetch(`${API_BACKEND}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        toast.success('Đã xóa người dùng');
        fetchUsers(localStorage.getItem("token") || '');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Xóa thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const url = editingUser.id
      ? `${API_BACKEND}/api/users/${editingUser.id}`
      : `${API_BACKEND}/api/users/create`;
    const method = editingUser.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingUser.id ? 'Cập nhật thành công' : 'Thêm mới thành công');
        setShowModal(false);
        setEditingUser(null);
        fetchUsers(localStorage.getItem("token") || '');
      } else {
        toast.error(data.error || 'Thao tác thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi kết nối server');
    }
  };

  if (!walletState.isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Cần kết nối ví</h2>
          <p className="text-yellow-700">Vui lòng kết nối ví MetaMask để truy cập trang quản lý</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Quản lý hệ thống</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-gray-50 p-2 rounded-md shadow-sm">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('users')}
        >
          👥 Người dùng
        </button>
        <button
          className={`ml-6 px-4 py-2 font-medium ${
            activeTab === 'permissions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('permissions')}
        >
          🔐 Quyền truy cập
        </button>
      </div>

      {error && toast.error(error, { onClose: clearError })}

      {/* Tab: Người dùng */}
      {activeTab === 'users' && (
        <div>
          <button
            onClick={() => {
              setEditingUser({ user_name: '', password: '', user_role: 'USER', wallet_address: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow mb-4"
          >
            ➕ Thêm người dùng
          </button>

          <div className="overflow-x-auto rounded border border-gray-200 shadow">
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="bg-blue-50 border-b text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Tên đăng nhập</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Địa chỉ ví</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_name} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{u.user_name}</td>
                    <td className="px-4 py-2">{u.user_role}</td>
                    <td className="px-4 py-2 font-mono text-blue-600">{u.wallet_address}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser({
                            id: u.id,
                            user_name: u.username,
                            user_role: u.user_role,
                            wallet_address: u.wallet_address,
                            password: '',
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ❌ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Quyền truy cập */}
      {activeTab === 'permissions' && (
        walletState.isOwner ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Quản lý quyền truy cập (Blockchain)</h2>
            <AdminPanel
              onAuthorize={handleAuthorize}
              onRevoke={handleRevoke}
              loading={loading}
              isOwner={walletState.isOwner}
            />
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Không có quyền</h2>
            <p className="text-red-700">Chỉ chủ hợp đồng mới có quyền quản lý truy cập blockchain.</p>
          </div>
        )
      )}

      {/* Modal thêm/sửa */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl border border-gray-200 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser.id ? "✏️ Sửa người dùng" : "➕ Thêm người dùng"}
            </h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                required
                value={editingUser.user_name}
                onChange={(e) => setEditingUser({ ...editingUser, user_name: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={editingUser.password}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="text"
                placeholder="Wallet Address"
                value={editingUser.wallet_address}
                onChange={(e) => setEditingUser({ ...editingUser, wallet_address: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <select
                value={editingUser.user_role}
                onChange={(e) => setEditingUser({ ...editingUser, user_role: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="Manufacturers">Nhà sản xuất</option>
                <option value="Distributors">Nhà phân phối</option>
                <option value="Retailers">Nhà bán lẻ</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                >
                  {editingUser.id ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
