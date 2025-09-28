import type { Request, RequestHandler, Response } from "express";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";
import { z } from "zod";

import { prisma } from "../config/db";
import { hashPassword } from "../helper/hashpassword";
import { comparePasswords } from "../helper/verifyPassword";
import { generateToken, type JWTPayload } from "../helper/jwt";
import { generateVerificationCode } from "../helper/generateCode";
import { sendVerificationToken } from "../helper/sendVerficationEmail";

//zod schema
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstname: z.string(),
  lastname: z.string(),
  mobile_number: z.string(),
  profilePictureUrl: z.string().url().optional(),
  bio: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().optional().nullable(),
  password: z.string().min(6),
  phone: z.string().optional().nullable(),
});

export const handleUserSignup: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  // Validate using Zod
  const parseResult = signupSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parseResult.error.flatten().fieldErrors,
    });
    console.log("Error paring data: ", parseResult.error.flatten().fieldErrors);
    return;
  }

  const {
    email,
    password,
    firstname,
    lastname,
    mobile_number,
    profilePictureUrl,
    bio,
  } = parseResult.data;

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        mobile_number,
        profilePictureUrl: profilePictureUrl ?? "",
        isOnline: true,
        bio,
      },
    });
    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("Prisma error:", error.message);
      res.status(500).json({ error: "Server Error" });
      return;
    }
    if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "Unexpected error occurred" });
      return;
    }
    res.status(500).json({ error: "Unknown error" });
  }
};

export const handleUserLogin: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parseResult.error.flatten().fieldErrors,
    });
    console.log(
      "Error parsing data: ",
      parseResult.error.flatten().fieldErrors,
    );
    return;
  }
  const { email, phone: mobile_number, password } = parseResult.data;
  if (!email && !mobile_number) {
    res.status(400).json({ error: "mobile_number or email required." });
    return;
  }
  const whereCondition = [];
  if (email) whereCondition.push({ email });
  if (mobile_number) whereCondition.push({ mobile_number });

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: whereCondition,
      },
    });
    if (!user) {
      res.status(400).json({ error: "User doesn't exist" });
      return;
    }
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "email or password incorrect" });
      return;
    }
    //jwt token
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
    };
    const token = generateToken(payload);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "lax",
    });
    console.log(token, "token send");
    res.json({ message: "Login Sucessfull" });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("Prisma error:", error.message);
      res.status(500).json({ error: "Database error" });
      return;
    }
    if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "Unexpected error occurred" });
      return;
    }
    res.status(500).json({ error: "Unknown error" });
  }
};

export const handleSendVerificationCode: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email } = req.body;
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const response = await prisma.userVerification.findUnique({
      where: {
        email,
      },
    });
    if (response) {
      await prisma.userVerification.delete({
        where: {
          id: response.id,
        },
      });
    }
    await prisma.userVerification.create({
      data: {
        email,
        verificationCode: code,
        expiryTime: expiresAt,
      },
    });
    await sendVerificationToken(code, email);
    res.json({ message: "Verfication Code sent to Email" });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("Prisma error:", error.message);
      res.json(500).json({ error: "Unexpected error occured." });
      return;
    }

    if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "Unexpected error occurred" });
      return;
    }
    console.log(error);
    res.status(500).json({ error: "Unknow error occured" });
  }
};

type VerificationTableType = {
  id: string;
  email: string;
  expiryTime: Date;
  verificationCode: string;
} | null;

export const handleVerificationCode: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      email,
      verificationCode,
    }: { email: string; verificationCode: string } = req.body;
    const response: VerificationTableType =
      await prisma.userVerification.findFirst({
        where: {
          email,
        },
      });
    if (response && response.verificationCode === verificationCode) {
      if (!(response.expiryTime > new Date())) {
        res
          .status(400)
          .json({ error: "Verfication Code is Expired, Resend Again" });
        return;
      }
      await prisma.userVerification.delete({
        where: {
          id: response.id,
        },
      });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid Code." });
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("Prisma error:", error.message);
      res.json(500).json({ error: "Unexpected error occured." });
      return;
    }

    if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "Unexpected error occurred" });
      return;
    }
    console.log(error);
    res.status(500).json({ error: "Unknow error occurred" });
  }
};
