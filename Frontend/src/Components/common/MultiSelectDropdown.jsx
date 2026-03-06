import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function MultiSelectDropdown({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
  emptyMessage = "No options available",
  accentColor = "#00988D",
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const safeOptions = useMemo(
    () =>
      [...new Set((options || []).map((item) => String(item).trim()).filter(Boolean))].sort(
        (left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }),
      ),
    [options],
  );

  const safeSelected = useMemo(
    () =>
      Array.isArray(selectedValues)
        ? Array.from(new Set(selectedValues.filter(Boolean).map(String)))
        : [],
    [selectedValues],
  );

  const selectedSet = useMemo(() => new Set(safeSelected), [safeSelected]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleOption = (value) => {
    if (disabled) return;
    const next = selectedSet.has(value)
      ? safeSelected.filter((item) => item !== value)
      : [...safeSelected, value];
    onChange?.(next);
  };

  const clearAll = () => {
    if (disabled) return;
    onChange?.([]);
  };

  const selectAll = () => {
    if (disabled) return;
    onChange?.(safeOptions);
  };

  const triggerLabel = useMemo(() => {
    if (safeSelected.length === 0) return placeholder;
    if (safeSelected.length <= 2) return safeSelected.join(", ");
    return `${safeSelected.length} selected`;
  }, [placeholder, safeSelected]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((previous) => !previous)}
        disabled={disabled}
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white text-left flex items-center justify-between gap-3 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <span className="truncate text-sm">{triggerLabel}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 mt-2 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100 mb-1">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium hover:opacity-80"
              style={{ color: accentColor }}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-red-600 hover:opacity-80"
            >
              Clear
            </button>
          </div>

          <div className="max-h-56 overflow-auto pr-1">
            {safeOptions.length === 0 ? (
              <p className="px-2 py-3 text-sm text-gray-500">{emptyMessage}</p>
            ) : (
              safeOptions.map((option) => {
                const selected = selectedSet.has(option);
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span
                      className="w-4 h-4 rounded border flex items-center justify-center"
                      style={{
                        borderColor: selected ? accentColor : "#CBD5E1",
                        backgroundColor: selected ? accentColor : "transparent",
                      }}
                    >
                      {selected && <Check size={12} className="text-white" />}
                    </span>
                    <span className="text-sm text-gray-700">{option}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {safeSelected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
