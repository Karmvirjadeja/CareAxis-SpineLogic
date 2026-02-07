import { cn } from "../../lib/utils";

interface PainScaleProps {
  value?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function PainScale({ value, onChange, className }: PainScaleProps) {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex space-x-2 justify-center">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn("pain-scale-button", value === num && "selected")}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>No Pain</span>
        <span>Severe Pain</span>
      </div>
    </div>
  );
}
