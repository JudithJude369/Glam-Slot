import {
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

const icons = {
  pin: MapPin,
  clock: Clock,
  chat: MessageCircle,
  shield: ShieldCheck,
  phone: Phone,
} as const;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const IconComponent = icons[name];
  return <IconComponent className={className} aria-hidden="true" />;
}