import { createContext, useContext } from 'react';

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
}

export const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext); 