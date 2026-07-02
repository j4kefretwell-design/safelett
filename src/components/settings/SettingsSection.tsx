import { type ReactNode } from "react";
import { settingsSectionLabelClassName } from "@/lib/ui";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  first?: boolean;
}

export default function SettingsSection({
  title,
  description,
  children,
  first = false,
}: SettingsSectionProps) {
  return (
    <section className={first ? "pb-12" : "border-t border-gold/30 py-12"}>
      <p className={settingsSectionLabelClassName}>{title}</p>
      {description && (
        <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-cocoa">
          {description}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}
