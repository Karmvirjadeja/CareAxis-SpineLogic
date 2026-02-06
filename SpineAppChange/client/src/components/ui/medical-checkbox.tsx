import { cn } from "../../lib/utils";
import { Checkbox } from "../../components/ui/checkbox";

interface MedicalCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function MedicalCheckbox({
  id,
  label,
  checked,
  onChange,
  className,
}: MedicalCheckboxProps) {
  return (
    <label
      className={cn("medical-checkbox", className)}
      htmlFor={id}
      style={{
        pointerEvents: "auto",
        cursor: "pointer",
        userSelect: "none",
        zIndex: 10,
        position: "relative",
      }}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => {
          console.log("Checkbox changed:", id, value);
          onChange(!!value);
        }}
        className="w-5 h-5"
      />
      <span className="text-sm ml-2">{label}</span>
    </label>
  );
}
