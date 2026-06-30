"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputClassName, labelClassName } from "@/lib/ui";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  minLength,
  required = true,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} pr-10`}
          placeholder={placeholder}
          autoComplete={id === "password" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-0 bottom-3 text-charcoal-muted transition hover:text-burgundy"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  );
}
