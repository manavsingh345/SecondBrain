import type { ReactElement } from "react";
export interface ButtonProps {
    variant:"primary" | "secondary";
    size: "sm" | "md" | "lg";
    text?:string;
    startIcon?: ReactElement;
    endIcon?:ReactElement;
    onClick?:() => void;
    fullWidth?:boolean;
    loading?:boolean;
}

const variantStyles = {
    "primary": "bg-blue-500 text-white hover:bg-blue-700 active:bg-blue-600 shadow-md hover:shadow-lg",
    "secondary": "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 shadow-sm hover:shadow-md",
};

const sizeStyle = {
    "sm": "py-2 px-3 text-sm",
    "md": "py-2.5 px-5 text-base",
    "lg": "py-3 px-6 text-lg",
};

const defaultStyle = "rounded-lg flex items-center justify-center cursor-pointer font-medium transition-all duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.loading}
      className={`
        ${variantStyles[props.variant]}
        ${defaultStyle}
        ${props.fullWidth ? "w-full" : ""}
        ${sizeStyle[props.size]}
        ${props.loading ? "opacity-70" : ""}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {props.startIcon && <span className="flex items-center justify-center">{props.startIcon}</span>}
        {props.text && <span>{props.text}</span>}
        {props.endIcon && <span className="flex items-center justify-center">{props.endIcon}</span>}
      </div>
    </button>
  );
};

