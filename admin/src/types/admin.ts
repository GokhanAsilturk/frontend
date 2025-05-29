export interface Admin {
  id: string;
  userId: string;
  department: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface AdminCreateData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  title: string;
}

export interface AdminUpdateData {
  firstName: string;
  lastName: string;
  department: string;
  title: string;
  username?: string;
  email?: string;
}