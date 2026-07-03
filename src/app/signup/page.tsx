import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/vojtech-bartonicek-wgG7jLQ7M0U-unsplash-auth.jpg"
        fetchPriority="high"
      />
      <AuthForm mode="signup" />
    </>
  );
}
