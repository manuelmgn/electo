import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Crear conta · Electo 26" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
