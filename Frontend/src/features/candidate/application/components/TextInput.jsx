import FieldLabel from "./FieldLabel";

export const inputClassName =
  "h-11 w-full rounded-xl border border-transparent bg-[#E6E6EA] px-3 text-[16px] text-[#0A0A0A] outline-none transition focus:border-[#0B8A8C] focus:bg-white";

export default function TextInput({ label, required = false, ...props }) {
  return (
    <div>
      <FieldLabel>
        {label}
        {required ? " *" : ""}
      </FieldLabel>
      <input {...props} className={inputClassName} />
    </div>
  );
}
