"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      offset={{ top: "88px", right: "1.5rem" }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "cx-toast",
          title: "cx-toast__title",
          description: "cx-toast__desc",
          icon: "cx-toast__icon",
        },
        style: {
          fontFamily: "var(--ff-body)",
        },
      }}
    />
  );
}
