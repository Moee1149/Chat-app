import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const backend_url = import.meta.env.VITE_BACKEND_URL;

type User = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  mobile_number: string;
};

// type CurrentUserResponse = {
//   user: User;
// };

type FindUserResponse = User[];

type handleAddNewChatType = {
  firstName: string;
  lastName: string;
  receiverId: string;
  senderId: string;
};

async function fetchUserByPhoneNumber(phone: string) {
  return axios.post<FindUserResponse>(`${backend_url}/user/find_user`, {
    phone,
  });
}

async function handleAddNewChat({
  receiverId,
  senderId,
  firstName,
  lastName,
}: handleAddNewChatType) {
  return axios.post(`${backend_url}/chat/add_chat`, {
    firstName,
    lastName,
    senderId,
    receiverId,
  });
}

export default function AddNewUserDialog({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useNavigate();
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
    showMessage: boolean;
  }>({
    isValid: false,
    message: "",
    showMessage: false,
  });

  const { data } = useCurrentUser();

  const mutation = useMutation({
    mutationFn: fetchUserByPhoneNumber,
    onSuccess: (data) => {
      console.log(data);
      const userExists = data.data && data.data.length > 0;
      setValidationState({
        isValid: true,
        message: userExists ? "User Exists" : "User not found",
        showMessage: true,
      });
    },
    onError: (error) => {
      console.error(error);
      setValidationState({
        isValid: false,
        message: "Error checking user",
        showMessage: true,
      });
    },
  });

  const addNewChatMutation = useMutation({
    mutationFn: handleAddNewChat,
    onSuccess: (data) => {
      console.log(data);
      const isNewChat = data?.data?.message?.includes("New chat created");

      if (isNewChat) {
        toast.success("New chat created successfully!");
      } else {
        toast.info("Loading existing chat...");
      }

      setFirstName("");
      setLastName("");
      setPhone("");
      setValidationState({
        isValid: true,
        message: "",
        showMessage: false,
      });

      // Close dialog and navigate
      onClose?.();
      router(`/chats?chatId=${data?.data?.chat.id}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error adding chat");
      setLastName("");
      setPhone("");
      setValidationState({
        isValid: true,
        message: "",
        showMessage: false,
      });
    },
  });

  const handlePhoneInputFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = e.target.value;

    // Only allow numeric input
    if (!/^\d*$/.test(newValue)) {
      return;
    }

    setPhone(newValue);

    if (newValue.length === 0) {
      setValidationState({
        isValid: false,
        message: "",
        showMessage: false,
      });
      mutation.reset();
    } else if (newValue.length > 0 && newValue.length < 8) {
      setValidationState({
        isValid: false,
        message: "",
        showMessage: false,
      });
      mutation.reset();
    } else if (newValue.length >= 8 && newValue.length <= 9) {
      setValidationState({
        isValid: false,
        message: "Phone number too short",
        showMessage: true,
      });
      mutation.reset();
    } else if (newValue.length === 10) {
      setValidationState({
        isValid: false,
        message: "Checking user...",
        showMessage: true,
      });
      mutation.mutate(newValue);
    } else if (newValue.length > 10) {
      setValidationState({
        isValid: false,
        message: "Invalid mobile number",
        showMessage: true,
      });
      mutation.reset();
    }
  };

  const handleForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone) {
      toast.error("Please fill in all fields");
      return;
    }

    const receiverId =
      mutation.data &&
      mutation.data.data?.length > 0 &&
      mutation.data.data[0]?.id;
    const senderId = data?.data?.user?.id;

    if (!receiverId) {
      toast.error("User not found. Please check the phone number.");
      return;
    }

    if (!senderId) {
      toast.error(
        "Unable to identify current user. Please refresh and try again.",
      );
      return;
    }

    addNewChatMutation.mutate({
      firstName,
      lastName,
      receiverId,
      senderId,
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader className="mb-3">
        <DialogTitle>Add new User</DialogTitle>
        <DialogDescription>
          Enter user details before sending message
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleForm}>
        <div className="grid gap-4 mb-4">
          <div className="flex gap-3">
            <div className="grid gap-3">
              <Label htmlFor="name-1">First Name</Label>
              <Input
                id="name-1"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={addNewChatMutation.isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Last Name</Label>
              <Input
                id="username-1"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={addNewChatMutation.isPending}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="name-1">Phone</Label>
            <Input
              id="name-1"
              name="phone"
              value={phone}
              onChange={handlePhoneInputFieldChange}
              disabled={addNewChatMutation.isPending}
            />
          </div>
          {validationState.showMessage && (
            <span
              className={`text-sm font-semibold mt-[-10px] ml-2 ${
                validationState.isValid &&
                validationState.message === "User Exists"
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {mutation.isPending && phone.length === 10
                ? "Checking user..."
                : validationState.message}
            </span>
          )}
          {addNewChatMutation.isPending && (
            <span className="text-sm font-semibold text-blue-500 ml-2">
              Creating chat...
            </span>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={addNewChatMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={
              addNewChatMutation.isPending ||
              !validationState.isValid ||
              validationState.message !== "User Exists"
            }
          >
            {addNewChatMutation.isPending ? "Creating..." : "Chat Now"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
