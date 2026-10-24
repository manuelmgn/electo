import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Iniciar sesión · Electo 26" };

// Con sesión activa non ten sentido o formulario: vaí ao editor.
export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");
  return <AuthForm mode="login" />;
}
