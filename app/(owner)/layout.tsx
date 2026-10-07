import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { OwnerShell } from "@/components/settings/owner-shell";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await getOwner();
  if (!owner.ok) redirect("/login");

  return <OwnerShell>{children}</OwnerShell>;
}
