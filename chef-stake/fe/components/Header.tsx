'use client'
import Image from "next/image";
import { Box } from "@mui/material";
import Settings from "./Settings";
import { useRouter } from 'next/navigation'

function Header() {
  const router = useRouter();
  const handleClick = () => {
    router.push('/')
  };
  return (
    <Box
      component="section"
      className="flex justify-between items-center w-full h-17 px-4 border-b border-gray-200"
    >
      <div className="flex cursor-pointer" onClick={handleClick}>
        <Image src="/logo.jpeg" alt="logo" width={64} height={64} />
        <div className="flex ml-2 items-center text-2xl font-bold w-52 h-16">Chef Stake</div>
      </div>
      <Settings />
    </Box>
  );
};

export default Header;
