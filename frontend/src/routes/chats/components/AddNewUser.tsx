import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

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

type AddNewUserDialogProps = {
  handleForm: (formData: FormData) => void;
};

function fetchUserByPhoneNumber(phone: string) {
  return axios.post("http://localhost:5000/api/user/find_user", { phone });
}

export default function AddNewUserDialog({
  handleForm,
}: AddNewUserDialogProps) {
  const [phone, setPhone] = useState("");
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
    showMessage: boolean;
  }>({
    isValid: false,
    message: "",
    showMessage: false,
  });

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

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader className="mb-3">
        <DialogTitle>Add new User</DialogTitle>
        <DialogDescription>
          Enter user details before sending message
        </DialogDescription>
      </DialogHeader>
      <form action={handleForm}>
        <div className="grid gap-4 mb-4">
          <div className="flex gap-3">
            <div className="grid gap-3">
              <Label htmlFor="name-1">First Name</Label>
              <Input id="name-1" name="name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Last Name</Label>
              <Input id="username-1" name="username" />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="name-1">Phone</Label>
            <Input
              id="name-1"
              name="phone"
              value={phone}
              onChange={handlePhoneInputFieldChange}
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Chat Now</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
