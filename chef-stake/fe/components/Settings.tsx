"use client";

import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Link from "next/link";
import WalletButton from "./WalletButton";

function Settings() {
  const Links = [
    {
      name: "Stake",
      path: "/",
    },
    {
      name: "Withdraw",
      path: "/withdraw",
    },
  ];
  const pathname = usePathname();
  return (
    <Box component="section" className="flex items-center h-16">
      {Links.map((link) => {
        const active = pathname === link.path || pathname === link.path + "/";
        return (
          <Link
            key={link.name}
            href={link.path}
            className={`mr-4 text-xl ${active && "font-semibold" }`}
          >
            {link.name}
          </Link>
        );
      })}
      <WalletButton />
    </Box>
  );
}

export default Settings;
