"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAuth } from "@/components/auth-provider";

/** Keep real URLs for new tabs, while opening authentication in-place on click. */
export function AuthLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { openAuth } = useAuth();
  return <Link {...props} onClick={(event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (props.href === "/login" || props.href === "/register") {
      event.preventDefault();
      openAuth(props.href === "/register" ? "register" : "login");
    }
  }} />;
}
