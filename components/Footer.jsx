import React from 'react';
import { BsFillBrushFill } from 'react-icons/bs';

const Footer = () => {
    return (
        <div className="w-full  ">
            <div className=' w-full py-8 m-auto border-t-4'>
                <div className='flex items-center m-auto justify-center'>
                    <BsFillBrushFill size={30} className='text-[var(--primary-dark)] mr-2' />
                    <h1 className='text-xl font-bold text-gray-700'>{(new Date().getFullYear())}</h1>
                </div>
            </div>
        </div>

    );
};

export default Footer;
