import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { setAuth, type AuthUser } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — PulseLink" },
      { name: "description", content: "Sign in to the PulseLink blood redistribution platform." },
    ],
  }),
  component: Login,
});

type LoginResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
  message?: string;
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pulselink.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<LoginResponse>("/api/auth/login", { email, password });
      setAuth(res.token, res.user);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Droplet className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">PulseLink</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Sign in to the blood redistribution network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          Demo credentials: <span className="font-medium text-foreground">admin@pulselink.com</span> /{" "}
          <span className="font-medium text-foreground">admin123</span>
        </p>
      </div>
    </div>
  );
}
