export type Message = {
  id?: string;
  text: string;
  senderId: string; // User ID of sender
  fileUrl?: string;
  chatId: string;
  seen?: boolean;
  delivered?: boolean;
  createdAt?: string; // This will be ISO string in frontend
};
