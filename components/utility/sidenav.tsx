"use client"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
//import { useLocation} from "react-router-dom"
import Link from "next/link"
import { CiMenuFries } from "react-icons/ci"
import Links from "../../data/links";
import { ModeToggle } from '@/components/ui/mode-toggle'
import { usePathname } from 'next/navigation';

const Sidenav = () => {
    const pathname = usePathname();                 
  return (
    <Sheet >
        <SheetTrigger className="flex justify-center items-center text-[27px] text-accent text-center font-bold h-full">
            <CiMenuFries />
        </SheetTrigger>
        <SheetHeader></SheetHeader>
        <SheetTitle></SheetTitle>
        <SheetContent className="flex flex-col justify-between items-center pt-20 /bg-red-500 h-full">
            <nav className="flex flex-1 w-full h-full flex-col /justify-center items-center gap-8 text-2xl pt-20">
                {/* <div className="h-10"></div> */}
                {Links.Links.map((link, index) => {
                    return (
                        <Link href={link.path} key={index} className={`${ link.path === pathname && "text-accent border-b-2 border-accent"} capitalize font-medium hover:text-accent transition-all`}>
                        {link.name}
                        </Link>
                     )
                })}
            </nav>
            <div className="my-5 w-full flex flex-row">
                <div className="flex w-full flex-1"></div>
                <ModeToggle />
            </div>
        </SheetContent>
    </Sheet>
  )
}

export default Sidenav
