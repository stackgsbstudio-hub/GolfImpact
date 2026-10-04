const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-[#482ece] text-white hover:-translate-y-0.5",
    secondary: "border-2 border-gray-500 hover:bg-[#482ece]",
  };

  return (
    <button
      {...props}
      className={`p-2 w-35 h-12 rounded-lg cursor-pointer transition-all ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
