export interface User {
  id?: string;
  _id?: string;  // MongoDB ID format
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  __v?: number;
}
