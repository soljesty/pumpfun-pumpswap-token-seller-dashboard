import React from "react";

interface InputProps {
    index: number;
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (
        index: number,
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    index,
    label,
    type = "text",
    placeholder = "Set Param...",
    value,
    onChange,
    className = "",
}) => {
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (onChange) {
            onChange(index, event);
        }
    };

    return (
        <div className="flex flex-col w-full gap-2">
            {label && (
                <label className="text-[15px] leading-5 text-white capitalize">
                    {label}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className={`w-full rounded-md font-primary focus:outline-none text-[15px] text-[#000000] leading-5 p-3 bg-[#D4D4D4] active:text-[#848D9E] ${className}`}
            />
        </div>
    );
};

export default Input;
