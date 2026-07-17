import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Fretwell & Co",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
