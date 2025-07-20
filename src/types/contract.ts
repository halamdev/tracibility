export interface Step {
  location: string;
  description: string;
  timestamp: bigint;
  actor: string;
  status: number;
}

export interface Product {
  name: string;
  ipfsHash: string;
  creator: string;
  status: number;
  steps: Step[];
  location: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isAuthorized: boolean;
  isOwner: boolean;
}

export interface ContractError {
  message: string;
  code?: string;
}

export enum ProductStatus {
  Created = 0,
  InProgress = 1,
  Completed = 2,
  Rejected = 3
}

export enum StepStatus {
  Manufactured = 0,
  Inspected = 1,
  Packaged = 2,
  Stored = 3,
  Shipped = 4,
  Received = 5,
  Sold = 6,
  Returned = 7,
  Disposed = 8
}

export const PRODUCT_STATUS_LABELS = {
  [ProductStatus.Created]: 'Đã tạo',
  [ProductStatus.InProgress]: 'Đang xử lý',
  [ProductStatus.Completed]: 'Hoàn thành',
  [ProductStatus.Rejected]: 'Bị từ chối'
};

export const STEP_STATUS_LABELS = {
  [StepStatus.Manufactured]: 'Sản xuất',
  [StepStatus.Inspected]: 'Kiểm tra',
  [StepStatus.Packaged]: 'Đóng gói',
  [StepStatus.Stored]: 'Lưu kho',
  [StepStatus.Shipped]: 'Vận chuyển',
  [StepStatus.Received]: 'Nhận hàng',
  [StepStatus.Sold]: 'Bán hàng',
  [StepStatus.Returned]: 'Trả hàng',
  [StepStatus.Disposed]: 'Hủy bỏ'
};

export const PRODUCT_STATUS_COLORS = {
  [ProductStatus.Created]: 'bg-blue-100 text-blue-800',
  [ProductStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [ProductStatus.Completed]: 'bg-green-100 text-green-800',
  [ProductStatus.Rejected]: 'bg-red-100 text-red-800'
};

export const STEP_STATUS_COLORS = {
  [StepStatus.Manufactured]: 'bg-purple-100 text-purple-800',
  [StepStatus.Inspected]: 'bg-blue-100 text-blue-800',
  [StepStatus.Packaged]: 'bg-indigo-100 text-indigo-800',
  [StepStatus.Stored]: 'bg-gray-100 text-gray-800',
  [StepStatus.Shipped]: 'bg-orange-100 text-orange-800',
  [StepStatus.Received]: 'bg-green-100 text-green-800',
  [StepStatus.Sold]: 'bg-emerald-100 text-emerald-800',
  [StepStatus.Returned]: 'bg-yellow-100 text-yellow-800',
  [StepStatus.Disposed]: 'bg-red-100 text-red-800'
};