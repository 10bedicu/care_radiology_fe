import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast as _toast, ToasterProps } from "sonner";
import { ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TODO: Share sonner toast package with core.
const defaultToastOptions = {
  position: "top-center" as ToasterProps["position"],
  richColors: true,
  style: {
    fontSize: "1rem",
    fontWeight: 600,
    padding: "1rem 1.5rem",
    minWidth: "400px"
  },
  duration: 6000,
  expand: true
};

export const toast = {
  error: (message: string | ReactNode, options = {}) =>
    _toast.error(message, { ...defaultToastOptions, ...options }),
  warning: (message: string | ReactNode, options = {}) =>
    _toast.warning(message, { ...defaultToastOptions, ...options }),
  success: (message: string | ReactNode, options = {}) =>
    _toast.success(message, { ...defaultToastOptions, ...options }),
};
