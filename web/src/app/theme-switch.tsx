"use client";

import ClientOnly from "@/app/client-only";
import { useMantineColorScheme } from "@mantine/core";

export const ThemeSwitch = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ClientOnly fallback={<button>Switch to loading theme</button>}>
      <button onClick={toggleColorScheme}>
        Switch to {colorScheme === "dark" ? "light" : "dark"} theme
      </button>
    </ClientOnly>
  );
};
