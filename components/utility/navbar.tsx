"use client"
import Link from 'next/link';
import Nav from './nav';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidenav from './sidenav';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Suspense } from "react"
import {AiOutlineSearch, AiOutlineHome, AiOutlineShop, AiOutlineMan, AiOutlineContacts} from "react-icons/ai"
import Advert from '../advert';

// import logo from "@/public/whitelogo.png"
// import greenlogo from "@/public/greenlogo.png"
// import Image from "next/image";
// import { Cart } from '../myComponents/subs/cart';
// import { SearchInput } from '../myComponents/subs/searchcomponent';

const Navbar = () => {
  return (
    <div className="w-screen overflow-clip flex flex-col m-0 p-0 relative">
      <header className="w-screen py-4 bg-background sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center h-[50px] overflow-clip">
            <div className="lg:hidden">
              <Sidenav />
            </div>
            {/* <Link href={"/"} className="flex dark:hidden flex-1 md:flex-none max-h-[43px] md:max-h-[50px] overflow-clip flex justify-center items-center py-5 /rounded-full">
                <Image src={greenlogo} alt="" className="w-[100px] h-auto"/>
            </Link>
            <Link href={"/"} className="hidden dark:flex flex-1 md:flex-none max-h-[43px] md:max-h-[50px] overflow-clip justify-center items-center py-5 /rounded-full">
                <Image src={logo} alt="" className="w-[100px] h-auto"/>
            </Link> */}

            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link
                  href="/"
                  className="flex items-center gap-1 text-xl font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 750 750"
                    className="h-7 w-7 text-primary"
                    fill="currentColor"
                  >
                    <defs>
                      <clipPath id="HMSLogo">
                        <path d="M 37.42 84.68 L 712.42 84.68 L 712.42 665.18 L 37.42 665.18 Z" />
                      </clipPath>
                    </defs>
                    <g clipPath="url(#HMSLogo)">
                      <path d="M 662.48 134.87 C 595.63 68.02 486.38 68.02 419.71 134.87 L 375.08 179.5 L 330.46 134.87 C 263.61 68.02 154.36 68.02 87.69 134.87 C 22.89 199.67 21.01 304.47 81.87 371.66 L 238.99 371.66 L 261.9 252.16 C 262.93 246.52 267.71 242.41 273.53 242.07 C 279.34 241.73 284.47 245.49 286.01 250.96 L 341.91 441.25 L 372.35 317.64 C 373.71 312.34 378.33 308.41 383.8 308.23 C 389.27 307.89 394.23 311.31 396.11 316.61 L 419.88 384.14 L 463.64 250.62 C 465.36 245.49 470.31 241.9 475.78 242.07 C 481.25 242.24 486.04 245.83 487.41 251.13 L 520.75 371.66 L 668.29 371.66 C 729.33 304.47 727.28 199.67 662.48 134.87 Z M 499.21 387.39 L 474.25 297.46 L 431.84 426.71 C 430.13 431.84 425.52 435.26 420.22 435.26 L 420.05 435.26 C 414.75 435.26 410.13 432.02 408.25 426.89 L 386.2 364.14 L 354.74 491.85 C 353.37 497.32 348.58 501.26 342.94 501.26 L 342.6 501.26 C 337.13 501.26 332.17 497.67 330.63 492.37 L 276.43 307.04 L 261.22 386.37 C 260.02 392.18 254.89 396.45 249.08 396.45 L 106.15 396.45 L 132.14 422.44 L 374.91 665.21 L 617.69 422.44 L 643.67 396.45 L 511 396.45 C 505.53 396.45 500.75 392.69 499.21 387.39 Z" />
                    </g>
                  </svg>
                  UITH
                </Link>
                {/* <div className="flex items-center gap-4">
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div> */}
              </div>
            
            
            <Button variant={"outline"} className="lg:hidden relative flex justify-center items-center rounded-full w-[35px] h-[35px] overflow-clip text-accent text-xl"><AiOutlineSearch /></Button>

            {/* <SearchInput /> */}


            <div className="hidden lg:flex items-center gap-8">

              <Nav/>
              {/*
                <Link to="/contact">
                  <Button className="">Hire me</Button>
                </Link>
              */}
              {/* <Cart /> */}
              <ModeToggle />
            </div>
        </div>
        <Advert />
      </header>
    </div>
  )
}

export default Navbar
