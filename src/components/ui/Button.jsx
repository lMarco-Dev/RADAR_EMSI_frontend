import { Loader2 } from "lucide-react";

export default function Button({
  children,
  loading,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={loading}
      {...props}
      className={`relative flex items-center justify-center py-2 px-4 rounded-md font-bold text-white transition-all duration-200 
      ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-700 hover:bg-red-800"} 
      ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
