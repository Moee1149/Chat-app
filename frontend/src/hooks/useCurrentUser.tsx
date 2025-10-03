// src/hooks/useCurrentUser.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      return await axios.get(`${backendUrl}/user/currentUser`, {
        withCredentials: true,
      });
    },
  });
}
