import React, { useEffect, useState } from "react";

interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    condition?: string;
    copy?: boolean;
    icon?: string;
    errState?: boolean;
    onChange?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    className?: string;
    validate?: (value: string) => string | null;
}

const Input: React.FC<InputProps> = ({
    label,
    type = "text",
    placeholder = "Enter text...",
    value,
    errState,
    onChange,
    className = "",
    validate,
}) => {
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newValue = event.target.value;
        if (validate) {
            setError(validate(newValue));
        }
        if (onChange) {
            onChange(event);
        }
    };

    useEffect(() => {
        if (!errState) {
            setError(null);
        }
    }, [errState])

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
                className={`w-full rounded-md font-primary focus:outline-none text-[15px] text-[#848D9E] leading-5 p-3 bg-[#D4D4D4] active:text-[#848D9E] ${className}`}
            />
            {error && (
                <p className="lining-nums proportional-nums text-[#FE4830] text-[12px] leading-[12px]">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
