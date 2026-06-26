import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Get Started</h2>
        <p className="text-sm text-zinc-400 mt-1">Register for an event planner or provider account</p>
      </div>

      <AuthForm mode="register" />

      <div className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <a href="/login" className="text-purple-400 hover:text-purple-300 transition font-medium">
          Sign In
        </a>
      </div>
    </div>
  );
}
