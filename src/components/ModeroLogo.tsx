import moderoLogo from "@/assets/modero-logo.png";

const ModeroLogo = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const heights = { sm: "h-12", default: "h-16", lg: "h-20" };

  return (
    <img src={moderoLogo} alt="Modero" className={`${heights[size]} w-auto`} />
  );
};

export default ModeroLogo;
