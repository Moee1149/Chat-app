import axios from "axios";
import { useNavigate } from "react-router";
import { useActionState } from "react";

import { toast } from "sonner";
import { LoginForm } from "@/components/login-form";
import { type ActionResult, LoginSchema } from "../utils";

const backend_url = import.meta.env.VITE_BACKEND_URL;

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginForm = async (
    prevData: ActionResult,
    formData: FormData,
  ): Promise<ActionResult> => {
    const rawData = {
      email: formData.get("email") ?? "",
      phone: formData.get("phone"),
      password: formData.get("password") as string,
    };
    const result = LoginSchema.safeParse(rawData);
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
          phone: fieldErrors.phone?.[0],
        },
      };
    }

    try {
      const response = await axios.post(
        `${backend_url}/auth/login`,
        result.data,
        { withCredentials: true },
      );
      toast.success(response.data?.message, {
        position: "top-center",
      });
      localStorage.clear();
      localStorage.setItem("userId", response.data?.user?.id);
      navigate("/chats");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        if (error.code === "ENOTFOUND") {
          toast.error("Network error: Host not found");
        } else if (error.code === "ECONNREFUSED") {
          toast.error("Connection refused");
        } else if (error.code === "ECONNABORTED") {
          toast.error("Request timeout");
        } else {
          const status = error.response?.status;
          if (status === 500) {
            toast.error("Server error. Please try again later.");
          } else if (status === 400) {
            toast.error(error.response?.data?.error);
          } else {
            toast.error(error.message);
          }
        }
      } else {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
    return {
      success: true,
    };
  };

  const [message, formAction] = useActionState<ActionResult, FormData>(
    handleLoginForm,
    { success: false },
  );
  return (
    <LoginForm
      className="min-w-sm max-w-md"
      cardTitle="Login to your account"
      cardDescription="Enter your email or mobile number below to login to your account"
      linkName="Signup"
      buttonValue="Login"
      formAction={formAction}
      errors={message.errors}
    />
  );
}
