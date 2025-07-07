"use client";
import UserHeader from "./UserHeader";
import { usePathname } from "next/navigation";

export default function ClientHeaderWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <UserHeader />;
} 