import React, {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {AiOutlineMail} from "react-icons/ai";
import {BsReverseLayoutTextSidebarReverse} from "react-icons/bs";
import {FaGithub, FaLinkedinIn} from "react-icons/fa";
import {HiOutlineChevronDoubleUp} from "react-icons/hi";
import ContactImg from "../public/assets/contact.jpg";
import {MainCircleIcon, MainCircleLink} from "./Main";

const Contact = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setName("");
        setPhone("");
        setEmail("");
        setSubject("");
        setMessage("");
    };

    return (
        <div id="contact" className="w-full lg:h-screen">
            <div className="max-w-[1240px] m-auto px-2 py-16 w-full">
                <p className="text-xl tracking-widest uppercase text-[#5651e5]">
                    {" "}
                    Contact
                </p>
                <h2 className="py-4">Get In Touch</h2>
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* left  */}
                    <div className="col-span-3 lg:col-span-2 w-full h-full shadow-xl shadow-gray-400 rounded-xl p-4">
                        <div className="lg:p-4 h-full ">
                            {/* ----------       image div */}
                            <div>
                                <Image
                                    className="rounded-xl hover:scale-105 ease-in duration-300"
                                    src={ContactImg}
                                    alt="/"
                                />
                            </div>
                            {/* ----------------      name Div */}
                            <div>
                                <h2 className="py-2">Biruk B Kassa</h2>
                                <p>Full-Stack Developer</p>
                                <p className="py-4">
                                    I am available for freelance or full-time positions. Contact
                                    me and let&apos;s talk.
                                </p>
                            </div>
                            {/* ----------------      Circle links DIV */}
                            <div>
                                <p className="uppercase pt-8">Connect With Me</p>
                                <div className="flex items-center justify-between py-4">
                                    <MainCircleIcon link={""} icon={<FaLinkedinIn/>}/>
                                    <MainCircleIcon link={"github.com/birukbelay"} icon={<FaGithub/>}/>
                                    <MainCircleLink link={"/#contact"} icon={<AiOutlineMail/>}/>
                                    <MainCircleLink
                                        link={"/resume"}
                                        icon={<BsReverseLayoutTextSidebarReverse/>}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right */}

                    <div className="col-span-3 w-full h-full shadow-xl shadow-gray-500 rounded-xl lg:p-4">
                        <div className="p-4">
                            <form action="" onSubmit={handleSubmit}>
                                {/* name & phone */}
                                <div className="grid md:grid-cols-2 gap-4 w-full py-2">
                                    {/*  */}
                                    <div className="flex flex-col">
                                        <label className="uppercase text-sm py-2">Name</label>
                                        <input
                                            className="border-2 rounded-lg p-3 flex border-gray-300"
                                            type="text"
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="uppercase text-sm py-2">
                                            Phone number
                                        </label>
                                        <input
                                            className="border-2 rounded-lg p-3 flex border-gray-300"
                                            type="text"
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* email */}
                                <div className="flex flex-col py-2">
                                    <label className="uppercase text-sm py-2">Email</label>
                                    <input
                                        className="border-2 rounded-lg p-3 flex border-gray-300"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {/* subject */}
                                <div className="flex flex-col py-2">
                                    <label className="uppercase text-sm py-2">Subject</label>
                                    <input
                                        className="border-2 rounded-lg p-3 flex border-gray-300"
                                        type="text"
                                        name="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                                {/* Message */}
                                <div className="flex flex-col py-2">
                                    <label className="uppercase text-sm py-2">Message</label>
                                    <textarea
                                        className="border-2 rounded-lg p-3 border-gray-300"
                                        rows="10"
                                        name="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}/>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full p-4 text-gray-100 mt-4">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center py-12">
                    <Link href="/">
                        <a>
                            <div
                                className="rounded-full shadow-lg shadow-gray-400 p-4 cursor-pointer hover:scale-110 ease-in duration-300">
                                <HiOutlineChevronDoubleUp
                                    className="text-[#5651e5]"
                                    size={30}
                                />
                            </div>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Contact;
