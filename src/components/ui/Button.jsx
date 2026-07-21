export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {

  const styles = {
    primary:
      "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/30"
  };

  return (
    <button
      type={type}
      className={`
        w-full
        rounded-2xl
        py-3
        font-semibold
        transition-all duration-200 /* Smooth animation */
        shadow-lg
        active:scale-95 /* Click animation */
        disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}