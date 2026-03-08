"use client";

import type React from "react";
import { Toaster as Sonner } from "sonner";

export function Toaster(props: React.ComponentProps<typeof Sonner>) {
  return <Sonner richColors closeButton position="top-right" {...props} />;
}
