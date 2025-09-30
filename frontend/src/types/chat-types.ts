// Types for chat list data
export interface CustomUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  bio: string;
  isOnline: boolean;
  lastSeen: string | null; // Use string for dates in frontend
  profilePictureUrl: string | null;
  customName: string;
}

export interface Chat {
  id: string;
  lastMessage: string;
  lastMessageAt: string | null; // Use string for dates in frontend
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  otherUsers: CustomUser[];
}
