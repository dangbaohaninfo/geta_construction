export type Role = "ADMIN" | "STAFF";
export type TransactionType = "CHI" | "THU";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  note?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdById: string;
  createdAt: string;
  project: { id: string; name: string; code: string };
  category: { id: string; name: string };
  createdBy: { id: string; name: string };
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalAmount: number;
}

export interface Employee {
  id: string;
  name: string;
  role?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  hoursWorked: number;
  note?: string | null;
  createdById: string;
  createdAt: string;
  employee: { id: string; name: string };
  project: { id: string; name: string; code: string };
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  projectCode: string;
  totalChi: number;
  totalThu: number;
  count: number;
}
