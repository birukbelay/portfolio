"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineClose, AiOutlineMenu, AiOutlineMail } from "react-icons/ai";
import { FaLinkedinIn, FaGithub, FaMedium } from "react-icons/fa";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { LINKS } from "../data/myLinks";
import { MainCircleIcon, MainCircleLink } from "./Main";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [shadow, setShadow] = useState(false);

  const navBarLinkStyle = "ml-10 text-sm uppercase hover:border-b";

  const handleNav = (val) => {
    setNav(val);
  };

  useEffect(() => {
    const handleShadow = () => {
      if (window.scrollY >= 90) {
        setShadow(true);
      } else {
        setShadow(false);
      }
    };
    window.addEventListener("scroll", handleShadow);
    return () => window.removeEventListener("scroll", handleShadow);
  }, []);

  return (
    <div
      className={
        shadow
          ? "fixed w-full h-20 shadow-xl z-[100] bg-[#ecf0f3] ease-in-out duration-300"
          : "fixed w-full h-20 z-[100] bg-[#ecf0f3]"
      }
    >
      {/* Desktop Navbar */}
      <div className="flex justify-between items-center w-full h-full px-2 2xl:px-16">
        <Link href="/">
          <Image
            src="/assets/bkLogo.png"
            alt="Logo"
            width={125}
            height={50}
          />
        </Link>
        <div>
          <ul className="hidden md:flex mr-4 items-center">
            <li>
              <Link href="/" className={navBarLinkStyle}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/#about" className={navBarLinkStyle}>
                About
              </Link>
            </li>
            <li>
              <Link href="/#skills" className={navBarLinkStyle}>
                Skills
              </Link>
            </li>
            <li>
              <Link href="/#projects" className={navBarLinkStyle}>
                Project
              </Link>
            </li>
            <li>
              <a
                href={LINKS.MediumUrl}
                target="_blank"
                rel="noreferrer"
                className={navBarLinkStyle}
              >
                Articles
              </a>
            </li>
            <li>
              <Link href="/#contact" className={navBarLinkStyle}>
                Contacts
              </Link>
            </li>
            <li>
              <Link href="/resume" className={navBarLinkStyle}>
                Resume
              </Link>
            </li>
          </ul>
          <div onClick={() => handleNav(true)} className="md:hidden cursor-pointer">
            <AiOutlineMenu size={25} />
          </div>
        </div>
      </div>

      {/* Mobile Nav bar */}
      <div
        className={
          nav ? "md:hidden fixed left-0 top-0 w-full h-screen bg-black/70" : ""
        }
      >
        {/* mobile sidebar */}
        <div
          className={
            nav
              ? "fixed left-0 top-0 w-[75%] sm:w-[60%] md:w-[45%] h-screen bg-[#ecf0f3] p-10 ease-in duration-500"
              : "fixed left-[-100%] top-0 p-10 ease-in duration-500"
          }
        >
          {/* mobile header */}
          <div>
            <div className="flex w-full items-center justify-between">
              <Link href="/" onClick={() => handleNav(false)}>
                <Image
                  src="/assets/bkLogo.png"
                  width={100}
                  height={100}
                  alt="Logo"
                />
              </Link>
              <div
                onClick={() => handleNav(false)}
                className="rounded-full shadow-lg shadow-gray-400 p-3 cursor-pointer"
              >
                <AiOutlineClose />
              </div>
            </div>
            <div className="border-b border-gray-300 my-4">
              <p className="w-[85%] md:w-[90%] py-4">
                Let&apos;s build something legendary together
              </p>
            </div>
          </div>

          {/* mobile menu */}
          <div className="py-4 flex flex-col">
            <ul className="uppercase">
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <Link href="/#home">Home</Link>
              </li>
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <Link href="/#about">About</Link>
              </li>
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <Link href="/#skills">Skills</Link>
              </li>
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <Link href="/#projects">Projects</Link>
              </li>
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <a href={LINKS.MediumUrl} target="_blank" rel="noreferrer">
                  Articles
                </a>
              </li>
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <Link href="/#contact">Contact</Link>
              </li>
              <li onClick={() => setNav(false)} className="py-4 text-sm">
                <Link href="/resume">Resume</Link>
              </li>
            </ul>
            <div className="pt-10">
              <p className="uppercase tracking-widest text-[#5651e5]">
                Let&apos;s Connect
              </p>
              <div className="flex items-center justify-between my-4 w-full sm:w-[90%]">
                <MainCircleIcon small={true} link={LINKS.LINKEDIN_URL} icon={<FaLinkedinIn />} />
                <MainCircleIcon small={true} link={LINKS.GITHUB_URL} icon={<FaGithub />} />
                <MainCircleIcon small={true} link={LINKS.MediumUrl} icon={<FaMedium />} />
                <MainCircleLink small={true} link="/#contact" icon={<AiOutlineMail />} />
                <MainCircleLink small={true} link="/resume" icon={<BsReverseLayoutTextSidebarReverse />} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

export const CircleIcon = ({ icon }) => {
  return (
    <div className="rounded-full shadow-lg shadow-gray-400 p-3 cursor-pointer hover:scale-110 ease-in duration-300">
      {icon}
    </div>
  );
};
