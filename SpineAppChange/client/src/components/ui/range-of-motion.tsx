import { useState } from "react";
import { cn } from "../../lib/utils";
import { MedicalCheckbox } from "./medical-checkbox";

interface RangeOfMotionProps {
  spineMovements: string[];
  neckMovements: string[];
  spineMovementPain: boolean;
  neckMovementPain: boolean;
  onSpineMovementChange: (movements: string[]) => void;
  onNeckMovementChange: (movements: string[]) => void;
  onSpineMovementPainChange: (hasPain: boolean) => void;
  onNeckMovementPainChange: (hasPain: boolean) => void;
  className?: string;
}

const SPINE_MOVEMENTS = [
  "Bending forward",
  "Bending backwards",
  "Bending on the side",
  "Left twisting",
  "Right twisting",
];

const NECK_MOVEMENTS = [
  "Extension",
  "Flexion",
  "Right lateral flexion",
  "Left lateral flexion",
  "Right rotation",
  "Left rotation",
];

export function RangeOfMotion({
  spineMovements,
  neckMovements,
  spineMovementPain,
  neckMovementPain,
  onSpineMovementChange,
  onNeckMovementChange,
  onSpineMovementPainChange,
  onNeckMovementPainChange,
  className,
}: RangeOfMotionProps) {
  const [currentView, setCurrentView] = useState<"spine" | "neck">("spine");

  const toggleSpineMovement = (movement: string) => {
    if (spineMovements.includes(movement)) {
      onSpineMovementChange(spineMovements.filter((m) => m !== movement));
    } else {
      onSpineMovementChange([...spineMovements, movement]);
    }
  };

  const toggleNeckMovement = (movement: string) => {
    if (neckMovements.includes(movement)) {
      onNeckMovementChange(neckMovements.filter((m) => m !== movement));
    } else {
      onNeckMovementChange([...neckMovements, movement]);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "spine", label: "Spine Range of Motion" },
          { key: "neck", label: "Neck Range of Motion" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key as any)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              currentView === key
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Spine Range of Motion */}
      {currentView === "spine" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Spine Range of Motion Assessment
          </h4>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">
                Unable to perform these spine movements:
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {SPINE_MOVEMENTS.map((movement) => (
                  <MedicalCheckbox
                    key={movement}
                    id={`spine-${movement}`}
                    label={movement}
                    checked={spineMovements.includes(movement)}
                    onChange={() => toggleSpineMovement(movement)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <MedicalCheckbox
                id="spine-movement-pain"
                label="Experiences pain during spine movements"
                checked={spineMovementPain}
                onChange={onSpineMovementPainChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Neck Range of Motion */}
      {currentView === "neck" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Neck Range of Motion Assessment
          </h4>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">
                Unable to perform these neck movements:
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {NECK_MOVEMENTS.map((movement) => (
                  <MedicalCheckbox
                    key={movement}
                    id={`neck-${movement}`}
                    label={movement}
                    checked={neckMovements.includes(movement)}
                    onChange={() => toggleNeckMovement(movement)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <MedicalCheckbox
                id="neck-movement-pain"
                label="Experiences pain during neck movements"
                checked={neckMovementPain}
                onChange={onNeckMovementPainChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Movement Summary */}
      {(spineMovements.length > 0 || neckMovements.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-medium text-yellow-900 mb-2">
            Movement Limitations Summary
          </h4>
          <div className="text-sm space-y-1">
            {spineMovements.length > 0 && (
              <div>
                <span className="font-medium">Spine limitations:</span>{" "}
                {spineMovements.join(", ")}
                {spineMovementPain && (
                  <span className="text-red-600 ml-2">(with pain)</span>
                )}
              </div>
            )}
            {neckMovements.length > 0 && (
              <div>
                <span className="font-medium">Neck limitations:</span>{" "}
                {neckMovements.join(", ")}
                {neckMovementPain && (
                  <span className="text-red-600 ml-2">(with pain)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
