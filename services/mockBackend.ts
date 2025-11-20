import { 
  User, Task, TaskSubmission, Transaction, 
  UserRole, AccountStatus, SubmissionStatus, 
  TransactionType, TransactionStatus 
} from '../types';

// --- Constants ---
const STORAGE_KEYS = {
  USERS: 'tr_users',
  TASKS: 'tr_tasks',
  SUBMISSIONS: 'tr_submissions',
  TRANSACTIONS: 'tr_transactions',
  CURRENT_USER: 'tr_current_user'
};

const REFERRAL_RATES = [5, 4, 3, 2, 1]; // Level 1 to 5
const ADMIN_EMAIL = 'admin@taskripple.com';
const ADMIN_PASS = 'admin123';
const ACTIVATION_FEE = 25;

// --- Helpers ---
const generateId = () => Math.random().toString(36).substring(2, 9);
const getNow = () => new Date().toISOString();

const loadData = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Initialization (Seeding) ---
export const initializeBackend = () => {
  let users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    // Seed Admin
    users.push({
      id: 'admin-001',
      fullName: 'Super Admin',
      email: ADMIN_EMAIL,
      phone: '0000000000',
      passwordHash: ADMIN_PASS,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      balance: 0,
      referrerId: null,
      referralCode: 'ADMIN001',
      createdAt: getNow()
    });
    // Seed some tasks
    const tasks: Task[] = [
      {
        id: 'task-001',
        title: 'Join Telegram Channel',
        description: 'Join our official channel and stay updated.',
        reward: 0.50,
        requirements: ['Join channel', 'Don\'t leave for 7 days'],
        proofType: 'IMAGE',
        createdAt: getNow()
      },
      {
        id: 'task-002',
        title: 'Write a 5-star Review',
        description: 'Review our app on the public forum.',
        reward: 1.00,
        requirements: ['Positive review', 'Include screenshot'],
        proofType: 'MIXED',
        createdAt: getNow()
      }
    ];
    saveData(STORAGE_KEYS.USERS, users);
    saveData(STORAGE_KEYS.TASKS, tasks);
  }
};

// --- Auth Services ---
export const loginUser = async (email: string, password: string): Promise<User> => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(u => u.email === email && u.passwordHash === password);
  if (!user) throw new Error('Invalid credentials');
  return user;
};

export const registerUser = async (data: Partial<User>): Promise<User> => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  if (users.find(u => u.email === data.email)) throw new Error('Email already exists');

  // Check referrer
  let referrerId: string | null = null;
  if (data.referrerId) { // This would be the referral CODE passed in form
    const referrer = users.find(u => u.referralCode === data.referrerId);
    if (referrer) referrerId = referrer.id;
  }

  const newUser: User = {
    id: generateId(),
    fullName: data.fullName!,
    email: data.email!,
    phone: data.phone!,
    passwordHash: data.passwordHash!,
    role: UserRole.USER,
    status: AccountStatus.PENDING,
    balance: 0,
    referrerId: referrerId,
    referralCode: generateId().toUpperCase(),
    createdAt: getNow()
  };

  users.push(newUser);
  saveData(STORAGE_KEYS.USERS, users);
  return newUser;
};

// --- User Actions ---
export const submitActivationPayment = async (userId: string, binanceId: string, proofUrl: string) => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) throw new Error('User not found');

  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  
  // Check if already submitted
  const existing = transactions.find(t => t.userId === userId && t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.PENDING);
  if (existing) throw new Error('Activation request already pending');

  const tx: Transaction = {
    id: generateId(),
    userId,
    type: TransactionType.DEPOSIT,
    amount: ACTIVATION_FEE,
    status: TransactionStatus.PENDING,
    description: 'Account Activation Fee',
    metadata: { binanceId, proofUrl },
    createdAt: getNow()
  };

  transactions.push(tx);
  users[userIndex].status = AccountStatus.REVIEW;
  
  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  saveData(STORAGE_KEYS.USERS, users);
  return tx;
};

export const submitTask = async (userId: string, taskId: string, proof: { text?: string, image?: string }) => {
  const submissions = loadData<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  const existing = submissions.find(s => s.userId === userId && s.taskId === taskId);
  if (existing) throw new Error('Task already submitted');

  const sub: TaskSubmission = {
    id: generateId(),
    userId,
    taskId,
    textProof: proof.text,
    imageProofUrl: proof.image,
    status: SubmissionStatus.PENDING,
    submittedAt: getNow()
  };
  submissions.push(sub);
  saveData(STORAGE_KEYS.SUBMISSIONS, submissions);
  return sub;
};

export const requestWithdrawal = async (userId: string, amount: number, binanceId: string) => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  if (user.balance < amount) throw new Error('Insufficient balance');

  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const tx: Transaction = {
    id: generateId(),
    userId,
    type: TransactionType.WITHDRAWAL,
    amount,
    status: TransactionStatus.PENDING,
    description: 'Withdrawal Request',
    metadata: { binanceId },
    createdAt: getNow()
  };
  transactions.push(tx);
  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  return tx;
};

// --- Admin Actions ---

// 1. Approve Activation (The Complex Part: Distribute Commissions)
export const approveActivation = async (txId: string) => {
  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) throw new Error('Transaction not found');
  
  const tx = transactions[txIndex];
  if (tx.type !== TransactionType.DEPOSIT || tx.status !== TransactionStatus.PENDING) {
    throw new Error('Invalid transaction state');
  }

  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const userIndex = users.findIndex(u => u.id === tx.userId);
  if (userIndex === -1) throw new Error('User not found');
  
  const user = users[userIndex];

  // Update Transaction
  transactions[txIndex].status = TransactionStatus.COMPLETED;
  
  // Update User Status
  user.status = AccountStatus.ACTIVE;

  // --- Distribute Commissions ---
  let currentUplineId = user.referrerId;
  let level = 0;

  while (currentUplineId && level < 5) {
    const uplineIndex = users.findIndex(u => u.id === currentUplineId);
    if (uplineIndex === -1) break;

    const uplineUser = users[uplineIndex];
    
    // Only active users get commission? Usually yes.
    if (uplineUser.status === AccountStatus.ACTIVE) {
      const commission = REFERRAL_RATES[level];
      
      // Add balance
      uplineUser.balance += commission;
      
      // Record Transaction
      transactions.push({
        id: generateId(),
        userId: uplineUser.id,
        type: TransactionType.REFERRAL_COMMISSION,
        amount: commission,
        status: TransactionStatus.COMPLETED,
        description: `Referral Commission Level ${level + 1}`,
        metadata: { relatedUserId: user.id, level: level + 1 },
        createdAt: getNow()
      });
    }

    currentUplineId = uplineUser.referrerId;
    level++;
  }

  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  saveData(STORAGE_KEYS.USERS, users);
};

export const rejectActivation = async (txId: string) => {
  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) return;
  
  const tx = transactions[txIndex];
  transactions[txIndex].status = TransactionStatus.REJECTED;

  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const uIndex = users.findIndex(u => u.id === tx.userId);
  if (uIndex > -1) users[uIndex].status = AccountStatus.PENDING; // Reset to pending so they can try again

  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  saveData(STORAGE_KEYS.USERS, users);
};

// 2. Approve Task Submission
export const approveSubmission = async (submissionId: string) => {
  const submissions = loadData<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  const subIndex = submissions.findIndex(s => s.id === submissionId);
  if (subIndex === -1) throw new Error('Submission not found');
  
  const sub = submissions[subIndex];
  if (sub.status !== SubmissionStatus.PENDING) return;

  const tasks = loadData<Task[]>(STORAGE_KEYS.TASKS, []);
  const task = tasks.find(t => t.id === sub.taskId);
  if (!task) throw new Error('Task not found');

  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const userIndex = users.findIndex(u => u.id === sub.userId);
  if (userIndex === -1) throw new Error('User not found');

  // Update Submission
  submissions[subIndex].status = SubmissionStatus.APPROVED;

  // Add Balance
  users[userIndex].balance += task.reward;

  // Record Transaction
  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  transactions.push({
    id: generateId(),
    userId: sub.userId,
    type: TransactionType.TASK_REWARD,
    amount: task.reward,
    status: TransactionStatus.COMPLETED,
    description: `Reward for task: ${task.title}`,
    metadata: { taskId: task.id },
    createdAt: getNow()
  });

  saveData(STORAGE_KEYS.SUBMISSIONS, submissions);
  saveData(STORAGE_KEYS.USERS, users);
  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
};

export const rejectSubmission = async (submissionId: string) => {
  const submissions = loadData<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  const subIndex = submissions.findIndex(s => s.id === submissionId);
  if (subIndex > -1) {
    submissions[subIndex].status = SubmissionStatus.REJECTED;
    saveData(STORAGE_KEYS.SUBMISSIONS, submissions);
  }
};

// 3. Approve Withdrawal
export const approveWithdrawal = async (txId: string) => {
  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) return;

  const tx = transactions[txIndex];
  
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const userIndex = users.findIndex(u => u.id === tx.userId);
  if (userIndex === -1) return;

  // Check balance again to be safe (though we checked on request, double check)
  if (users[userIndex].balance < tx.amount) {
    throw new Error('Insufficient balance at time of approval');
  }

  // Deduct balance
  users[userIndex].balance -= tx.amount;
  transactions[txIndex].status = TransactionStatus.COMPLETED;

  saveData(STORAGE_KEYS.USERS, users);
  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
};

export const rejectWithdrawal = async (txId: string) => {
  const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex > -1) {
    transactions[txIndex].status = TransactionStatus.REJECTED;
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  }
};

// --- Data Accessors for UI ---
export const getTasks = () => loadData<Task[]>(STORAGE_KEYS.TASKS, []);
export const createTask = (task: Task) => {
  const tasks = getTasks();
  tasks.push(task);
  saveData(STORAGE_KEYS.TASKS, tasks);
};
export const deleteTask = (taskId: string) => {
  const tasks = loadData<Task[]>(STORAGE_KEYS.TASKS, []);
  const newTasks = tasks.filter(t => t.id !== taskId);
  saveData(STORAGE_KEYS.TASKS, newTasks);
};
export const getTransactions = () => loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
export const getUsers = () => loadData<User[]>(STORAGE_KEYS.USERS, []);
export const getSubmissions = () => loadData<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);

// --- Shared Helpers ---
export const getUserName = (userId: string): string => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(u => u.id === userId);
  return user ? user.fullName : 'Unknown User';
};

// --- User Management for Admin ---
export const updateUserStatus = (userId: string, status: AccountStatus) => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const index = users.findIndex(u => u.id === userId);
  if (index > -1) {
    users[index].status = status;
    saveData(STORAGE_KEYS.USERS, users);
  }
};

export const updateUserRole = (userId: string, role: UserRole) => {
  const users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const index = users.findIndex(u => u.id === userId);
  if (index > -1) {
    users[index].role = role;
    saveData(STORAGE_KEYS.USERS, users);
  }
};

initializeBackend();