import type { ChangeEvent, InputHTMLAttributes } from "react";

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string;
  onChange: (rawDigits: string) => void;
};

function formatThousands(digits: string) {
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

export function NumberInput({ value, onChange, ...props }: NumberInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatThousands(value)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value.replace(/\D/g, ""));
      }}
    />
  );
}
