import {AiOutlineSearch, AiOutlineHome, AiOutlineShop, AiOutlineMan, AiOutlineContacts, AiOutlineWoman, AiOutlineProfile,AiOutlineHistory} from "react-icons/ai"
import { BiPhoneCall, BiSolidContact, BiPhone,} from "react-icons/bi"
import { CiShoppingCart, } from "react-icons/ci"
import { IoMdHelp } from "react-icons/io";
import { VscAccount } from "react-icons/vsc";
import { MdOutlineLocalPharmacy, MdMedicationLiquid } from "react-icons/md";
import {FaUserDoctor, FaUserNurse, } from "react-icons/fa6";
import {FaHospitalUser } from "react-icons/fa";
import {FcAbout } from "react-icons/fc";




export default {Links : [
    {
      name: <AiOutlineHome />,
      path: "/",
    },
    {
      name: <MdMedicationLiquid />,
      path: "/pharmacy",
    },
    // {
    //   name: <IoMdHelp />,
    //   path: "/help",
    // },
    // {
    //   name: <IoFastFoodOutline />,
    //   path: "/lunch",
    // },
    {
      name: <FcAbout />,
      path: "/about",
    },
    {
      name: <BiPhone />,
      path: "/contact",
    },
    {
      name: <FaHospitalUser />,
      path: "/patient",
    },
    {
      name: <FaUserNurse />,
      path: "/nurse",
    },
    {
      name: <FaUserDoctor />,
      path: "/doctor",
    },
    {
      name: <VscAccount />,
      path: "/account",
    },
    // {
    //   name: "blogs",
    //   path: "/blogs",
    // },
    // {
    //   name: <CiShoppingCart />,
    //   path: "/cart",
    // },
  ]
}