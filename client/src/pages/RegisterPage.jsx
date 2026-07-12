import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { neuroflowApi } from "../api/neuroflow.js";
import { useAuthStore } from "../store/authStore.js";

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  if (token) return <Navigate to="/" replace />;

  const submit = async (values) => {
    try {
      setSession(await neuroflowApi.register(values));
      navigate("/");
    } catch (error) {
      setError("root", { message: error.response?.data?.message || "Unable to create account" });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 auth-bg">
      <section className="glass-panel w-full max-w-[420px] p-8 md:p-10 animate-fade-in relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="relative z-10">
          <BrainCircuit className="text-primary mb-4 shadow-sm" size={36} />
          <p className="text-primary font-bold text-xs tracking-[0.15em] mb-2">NEUROFLOW AI</p>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Create your workspace</h1>
          <p className="text-text-muted text-sm mb-8">Join to experience local AI document intelligence.</p>
          
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
            <div>
              <label className="label-text">Name</label>
              <input type="text" className="input-field" placeholder="John Doe" {...register("name", { required: "Name is required" })} />
            </div>
            
            <div>
              <label className="label-text">Email</label>
              <input type="email" className="input-field" placeholder="name@example.com" {...register("email", { required: "Email is required" })} />
            </div>
            
            <div>
              <label className="label-text">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Use at least 6 characters" } })} />
            </div>
            
            {(errors.name || errors.email || errors.password || errors.root) && (
              <p className="text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                {errors.name?.message || errors.email?.message || errors.password?.message || errors.root?.message}
              </p>
            )}
            
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? "Creating…" : "Create account"}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border text-sm text-center">
            <p className="text-text-muted">Already have an account? <Link to="/login" className="text-primary hover:text-primary-hover font-medium ml-1">Sign in</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
