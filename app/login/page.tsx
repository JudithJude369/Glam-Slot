import Image from "next/image";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { loginCopy, loginPhotos } from "@/lib/login-copy";
import { getPublicSalonDetails } from "@/lib/public-salon";
import { LoginForm } from "./login-form";

function Logo({ size, className }: { size: number; className?: string }) {
  return (
    <Image
      src={loginPhotos.logo}
      alt=""
      width={size}
      height={size}
      className={`${className ?? ""} rounded-full object-cover`}
      style={{ width: size, height: size }}
      priority
    />
  );
}

export default async function LoginPage() {
  const owner = await getOwner();
  if (owner.ok) redirect("/dashboard");

  const salon = await getPublicSalonDetails();

  return (
    <main className="min-h-dvh bg-blush">
      {/* Mobile, 375px: one blush screen with the card above centre. */}
      <div className="flex min-h-dvh flex-col items-center px-6 pt-[126px] pb-10 md:hidden">
        <div className="w-full max-w-[326px] rounded-[32px] border border-border bg-card p-6">
          <Logo size={48} className="mx-auto" />
          <div className="mt-3">
            <LoginForm variant="mobile" />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {loginCopy.footnote}
        </p>
      </div>

      {/* Tablet, 768px to 1023px: photo half, form half. */}
      <div className="hidden min-h-dvh grid-cols-2 md:grid lg:hidden">
        <div className="relative">
          <Image
            src={loginPhotos.hero}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
            style={{ objectPosition: "70% 50%" }}
            priority
          />
        </div>
        <div className="flex items-center justify-center bg-blush p-6">
          <div className="w-full max-w-[318px] rounded-[32px] border border-border bg-card p-6">
            <Logo size={44} />
            <div className="mt-4">
              <LoginForm variant="tablet" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop, 1024px and up: plum panel half, form half, no photo. */}
      <div className="hidden min-h-dvh grid-cols-2 lg:grid">
        <div className="flex flex-col justify-between bg-plum p-16 text-white">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <span className="font-serif text-xl text-white">{salon.name}</span>
          </div>
          <div>
            <h2 className="max-w-[13ch] font-serif text-[56px] leading-[1.05] text-white">
              {loginCopy.panel.heading}
            </h2>
            <p className="mt-4 max-w-[46ch] text-lg text-white/70">
              {loginCopy.panel.sub}
            </p>
          </div>
          <p className="text-[15px] text-white/70">{loginCopy.panel.trust}</p>
        </div>
        <div className="flex items-center justify-center bg-blush p-6">
          <div className="w-full max-w-[500px] rounded-[32px] border border-border bg-card p-10">
            <LoginForm variant="desktop" />
          </div>
        </div>
      </div>
    </main>
  );
}