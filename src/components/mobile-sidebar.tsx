"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { NavLinks } from "./nav-links"
import Image from "next/image"

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="p-1.5 bg-[#B07A57] rounded-s-2xl rounded-t-2xl border border-black">
            <Image src={"/logo.svg"} width={30} height={60} alt="logo" />
          </div>
          <span className="text-2xl font-semibold">
            Kopiko
          </span>
        </div>
        <NavLinks isMobile />
      </SheetContent>
    </Sheet>
  )
} 