import HR_COLORS from "../../theme/hrPalette";

export default function SectionNavBar({ items = [], activeKey, onChange }) {
  const colors = HR_COLORS;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm" aria-label="Section navigation">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 overflow-x-auto">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange?.(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive ? "text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
                style={isActive ? { backgroundColor: colors.stonewash } : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
