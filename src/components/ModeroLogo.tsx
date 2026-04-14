import moderoLogo from "@/assets/modero-logo.png";

const ModeroLogo = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const heights = { sm: "h-8", default: "h-10", lg: "h-14" };

  return (
    <img src={moderoLogo} alt="Modero" className={`${heights[size]} w-auto`} />
  );
};

export default ModeroLogo;
