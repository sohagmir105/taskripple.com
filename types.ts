export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum AccountStatus {
  PENDING = 'PENDING', // Registered, email verified (simulated), but not paid
  REVIEW = 'REVIEW',   // Payment submitted, waiting admin
  ACTIVE = 'ACTIVE',   // Payment approved, can do tasks
  BANNED = 'BANNED'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string; // In real app this is hashed
  role: UserRole;
  status: AccountStatus;
  balance: number;
  referrerId: string | null; // Who referred this user
  referralCode: string; // Unique code for this user
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  requirements: string[];
  proofType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED';
  createdAt: string;
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  textProof?: string;
  imageProofUrl?: string;
  status: SubmissionStatus;
  submittedAt: string;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT', // Activation Fee
  WITHDRAWAL = 'WITHDRAWAL',
  TASK_REWARD = 'TASK_REWARD',
  REFERRAL_COMMISSION = 'REFERRAL_COMMISSION'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  metadata?: {
    binanceId?: string; // For deposits/withdraws
    proofUrl?: string; // For deposits
    relatedUserId?: string; // For commissions (who triggered it)
    level?: number; // For commissions (1-5)
    taskId?: string; // For task rewards
  };
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
