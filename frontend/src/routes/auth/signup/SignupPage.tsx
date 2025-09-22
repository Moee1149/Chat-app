import { useActionState, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

import { LoginForm as SignupForm } from "@/components/login-form";
import { toast } from "sonner";

import { type ActionResult, SignupSchema } from "../utils";

export let email = "";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignupPage() {
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  const handleEmailCheck = async (formData: FormData): Promise<void> => {
    email = formData.get("email") as string;

    const result = SignupSchema.pick({ email: true }).safeParse({ email });
    if (!result.success) {
      const emailError = result.error.flatten().fieldErrors.email?.[0];
      toast.error(emailError || "Invalid email");
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/user/user_exist`, {
        email,
      });
      if (data.error) {
        toast.error("User with this email already Exits");
        return;
      }
      setEmailVerified(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorMessage =
          err.response?.data?.error || "Something went wrong";

        if (status === 400) {
          toast.error("Email is required");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Unknown error occurred");
        console.error(err);
      }
    }
  };

  const handleSignupForm = async (
    prevData: ActionResult,
    formData: FormData,
  ): Promise<ActionResult> => {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = SignupSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      toast.error("Error Submitting Form", {
        position: "top-center",
      });
      return {
        success: false,
        errors: {
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        },
      };
    }

    localStorage.setItem("email", rawData.email);
    localStorage.setItem("password", rawData.password);
    try {
      await axios.post(`${backendUrl}/auth/sendVerificationCode`, {
        email,
      });
      toast.success("Submit Successfully.", {
        position: "top-center",
      });
      navigate("/auth/signup/verification");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage =
          error.response?.data?.error || "Something went wrong";

        if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Unknown error occurred");
        console.error(error);
      }
    }
    return {
      success: true,
    };
  };

  const [message, formAction] = useActionState<ActionResult, FormData>(
    handleSignupForm,
    { success: false },
  );

  return (
    <SignupForm
      className="min-w-sm max-w-md"
      cardTitle="Signup to create your new  account"
      cardDescription="Enter your email below to create your new  account"
      buttonValue="Sign up"
      linkName="Login"
      formAction={formAction}
      errors={message.errors}
      verified={emailVerified}
      emailFormAction={handleEmailCheck}
    />
  );
}
