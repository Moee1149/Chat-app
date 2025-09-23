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
import { useState } from "react";

export default function AddNewUserDialog({
  handleForm,
}: {
  handleForm: (formData: FormData) => void;
}) {
  const [phone, setPhone] = useState("");

  const handlePhoneInputFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = e.target.value;
    setPhone(newValue);
    if (newValue.length > 10) {
      console.log("invalid number");
    } else if (newValue.length === 10) {
      console.log("hit 10");
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
          {false ? (
            <span className="text-sm font-semibold text-emerald-500 mt-[-10px] ml-2">
              User Exits
            </span>
          ) : (
            <span className="text-sm font-semibold text-red-500 mt-[-10px] ml-2">
              Invalid mobile number
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
