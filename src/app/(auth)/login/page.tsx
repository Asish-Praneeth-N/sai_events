import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Welcome Back</h2>
        <p className="text-sm text-zinc-400 mt-1">Sign in to manage your events</p>
      </div>

      <AuthForm mode="login" />

      <div className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-purple-400 hover:text-purple-300 transition font-medium">
          Create Account
        </a>
      </div>
    </div>
  );
}
