const ModeroLogo = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizes = {
    sm: { icon: "w-8 h-8 text-base", text: "text-lg" },
    default: { icon: "w-10 h-10 text-xl", text: "text-2xl" },
    lg: { icon: "w-14 h-14 text-2xl", text: "text-3xl" },
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${sizes[size].icon} gradient-primary rounded-xl flex items-center justify-center font-bold text-primary-foreground shadow-orange`}>
        M
      </div>
      <span className={`${sizes[size].text} font-bold text-primary`}>Modero</span>
    </div>
  );
};

export default ModeroLogo;
