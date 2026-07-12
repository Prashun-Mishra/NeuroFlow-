import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { neuroflowApi } from "../api/neuroflow.js";
import { useAuthStore } from "../store/authStore.js";

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();

  if (token) return <Navigate to="/" replace />;

  const submit = async (values) => {
    try {
      setSession(await neuroflowApi.login(values));
      navigate(location.state?.from || "/");
    } catch (error) {
      setError("root", { message: error.response?.data?.message || "Unable to sign in" });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 auth-bg">
      <section className="glass-panel w-full max-w-[420px] p-8 md:p-10 animate-fade-in relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="relative z-10">
          <BrainCircuit className="text-primary mb-4 shadow-sm" size={36} />
          <p className="text-primary font-bold text-xs tracking-[0.15em] mb-2">NEUROFLOW AI</p>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Welcome back</h1>
          <p className="text-text-muted text-sm mb-8">Ask grounded questions over your workspace documents.</p>
          
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
            <div>
              <label className="label-text">Email</label>
              <input type="email" className="input-field" placeholder="name@example.com" {...register("email", { required: "Email is required" })} />
            </div>
            
            <div>
              <label className="label-text">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" {...register("password", { required: "Password is required" })} />
            </div>
            
            {(errors.email || errors.password || errors.root) && (
              <p className="text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                {errors.email?.message || errors.password?.message || errors.root?.message}
              </p>
            )}
            
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3 text-sm text-center">
            <p className="text-text-muted">Demo: demo@neuroflow.ai / Password@123</p>
            <p className="text-text-muted">New here? <Link to="/register" className="text-primary hover:text-primary-hover font-medium ml-1">Create an account</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
