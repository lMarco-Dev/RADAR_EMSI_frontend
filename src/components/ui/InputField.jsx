export default function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col mb-4">
      {/* Si nos pasan un label, lo dibujamos */}
      {label && (
        <label className="mb-1 text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* El input real */}
      <input
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all"
      />
    </div>
  );
}
