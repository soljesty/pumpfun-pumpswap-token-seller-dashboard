import { useEffect, useRef, useState } from 'react'
import { Icon } from "@iconify-icon/react";
import { useUserProvider } from '@/contexts/UserContext';
import { setJitoLocation } from '@/utils/utils';

const jitoLocations: string[] = [
    "mainnet",
    "amsterdam",
    "frankfurt",
    "ny",
    "tokyo",
]

const JitoDropdown = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { jitoLocation, setJitoLocationState } = useUserProvider();

    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleJitoLocationChange = async (location: string) => {
        setIsOpen(!isOpen)
        setJitoLocationState(location);
        setJitoLocation(location); // Update in Redis
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full relative inline-block text-left" ref={dropdownRef}>
            <button className="flex w-full px-[10px] py-[6px] justify-between items-center bg-[#141625] rounded-[15px] focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
                <p className="text-[#B5C3D575] text-base font-bold font-istok">{jitoLocation}</p>
                <Icon icon={isOpen ? "bxs:up-arrow" : "bxs:down-arrow"} width="10" height="10" style={{ color: "#B5C3D575" }} />
            </button>
            {isOpen && (
                <div className="absolute left-0 z-20 mt-2 w-full bg-[#1E1E2F] rounded-md shadow-lg focus:outline-none">
                    <div className="py-1" role="none">
                        {jitoLocations.map((item, index) => (
                            <div key={index} className="flex items-center px-[10px] py-[6px] gap-2 hover:bg-[#141625] rounded-md cursor-pointer" onClick={() => handleJitoLocationChange(item)}>
                                <p className="text-[#B5C3D575] text-base font-bold font-istok">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default JitoDropdown
