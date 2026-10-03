"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});

export type SignInState = { error: string | null };

export const initialSignInState: SignInState = { error: null };

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // The provider error can say whether the address exists, so it is not
    // shown and not logged.
    return { error: "Incorrect email or password." };
  }

  const owner = await getOwner();
  if (!owner.ok) {
    await supabase.auth.signOut();
    return { error: "That account is not the salon owner." };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}