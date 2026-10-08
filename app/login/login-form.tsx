"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginCopy } from "@/lib/login-copy";
import { signIn, type SignInState } from "./actions";

type Variant = keyof typeof loginCopy.heading;

// A "use server" file may only export async functions, so this lives here.
const initialSignInState: SignInState = { error: null };

const field = (invalid: boolean) =>
  [
    "h-[52px] w-full rounded-full border bg-input pl-12 pr-5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:h-14",
    invalid ? "border-danger" : "border-border",
  ].join(" ");

const icon = "pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground";

export function LoginForm({ variant }: { variant: Variant }) {
  // Both fields are controlled. React resets uncontrolled fields once a form
  // action finishes, and the spec keeps the typed email after a failure.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: SignInState, formData: FormData) => {
      const result = await signIn(previous, formData);
      // The spec keeps the typed email and clears the password after a failed
      // sign-in. A successful sign-in never returns: it redirects, by throwing.
      setPassword("");
      return result;
    },
    initialSignInState,
  );

  const invalid = Boolean(state.error);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className={variant === "mobile" ? "text-center" : "text-left"}>
        <h1 className="font-serif text-[28px] leading-tight text-foreground lg:text-[36px]">
          {loginCopy.heading[variant]}
        </h1>
        <p className="mt-1 text-base text-muted-foreground lg:text-[15px]">
          {loginCopy.sub[variant]}
        </p>
      </div>

      <label className="relative block">
        <span className="sr-only">Email</span>
        <Mail aria-hidden="true" className={icon} />
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${field(invalid)} pr-5`}
        />
      </label>

      <label className="relative block">
        <span className="sr-only">Password</span>
        <Lock aria-hidden="true" className={icon} />
        <input
          type={passwordVisible ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={`${field(invalid)} pr-14`}
        />
        <button
          type="button"
          onClick={() => setPasswordVisible((shown) => !shown)}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {passwordVisible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </label>

      {invalid ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-[52px] w-full rounded-full bg-plum text-base font-medium text-white hover:bg-plum/90 lg:h-14 lg:bg-primary lg:hover:bg-primary/80"
      >
        {pending
          ? "Signing in…"
          : variant === "desktop"
            ? loginCopy.button.desktop
            : loginCopy.button.small}
      </Button>
    </form>
  );
}