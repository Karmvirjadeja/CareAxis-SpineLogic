import { useState } from "react";
import { cn } from "../../lib/utils";
import { MedicalCheckbox } from "./medical-checkbox";

interface GaitAssessmentProps {
  values: {
    canWalkOnRightToe: boolean;
    canWalkOnLeftToe: boolean;
    canWalkOnRightHeel: boolean;
    canWalkOnLeftHeel: boolean;
    canWalkInLine: string;
    gaitPattern: string;
  };
  onChange: (field: string, value: any) => void;
  className?: string;
}

export function GaitAssessment({
  values,
  onChange,
  className,
}: GaitAssessmentProps) {
  const [currentView, setCurrentView] = useState<
    "heel-toe" | "tandem" | "pattern"
  >("heel-toe");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "heel-toe", label: "Heel-Toe Walking" },
          { key: "tandem", label: "Tandem Walk" },
          { key: "pattern", label: "Gait Pattern" },
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

      {/* Heel-Toe Walking Assessment */}
      {currentView === "heel-toe" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Heel-Toe Walking Assessment
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Toe Walking */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Toe Walking Ability</h5>
              <MedicalCheckbox
                id="canWalkRightToe"
                label="Can walk on right toe"
                checked={values.canWalkOnRightToe}
                onChange={(checked) => onChange("canWalkOnRightToe", checked)}
              />
              <MedicalCheckbox
                id="canWalkLeftToe"
                label="Can walk on left toe"
                checked={values.canWalkOnLeftToe}
                onChange={(checked) => onChange("canWalkOnLeftToe", checked)}
              />
            </div>

            {/* Heel Walking */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">
                Heel Walking Ability
              </h5>
              <MedicalCheckbox
                id="canWalkRightHeel"
                label="Can walk on right heel"
                checked={values.canWalkOnRightHeel}
                onChange={(checked) => onChange("canWalkOnRightHeel", checked)}
              />
              <MedicalCheckbox
                id="canWalkLeftHeel"
                label="Can walk on left heel"
                checked={values.canWalkOnLeftHeel}
                onChange={(checked) => onChange("canWalkOnLeftHeel", checked)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tandem Walk Assessment */}
      {currentView === "tandem" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Tandem Walk Assessment
          </h4>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Can walk in a straight line (tandem walk)?
              </span>
              <select
                value={values.canWalkInLine || ""}
                onChange={(e) => onChange("canWalkInLine", e.target.value)}
                className="medical-input"
              >
                <option value="">Select ability level</option>
                <option value="yes_easily">Yes, easily without support</option>
                <option value="yes_difficulty">
                  Yes, with some difficulty
                </option>
                <option value="needs_support">Needs support/assistance</option>
                <option value="cannot">Cannot perform</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Gait Pattern Assessment */}
      {currentView === "pattern" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Overall Gait Pattern
          </h4>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Observed gait pattern
              </span>
              <select
                value={values.gaitPattern || ""}
                onChange={(e) => onChange("gaitPattern", e.target.value)}
                className="medical-input"
              >
                <option value="">Select gait pattern</option>
                <option value="normal">Normal gait</option>
                <option value="antalgic">
                  Antalgic gait (limping due to pain)
                </option>
                <option value="ataxic">
                  Ataxic gait (unsteady, wide-based)
                </option>
                <option value="spastic">Spastic gait (stiff, dragging)</option>
                <option value="trendelenburg">
                  Trendelenburg gait (hip weakness)
                </option>
                <option value="steppage">Steppage gait (foot drop)</option>
                <option value="waddling">
                  Waddling gait (bilateral hip weakness)
                </option>
                <option value="festinating">
                  Festinating gait (shuffling, accelerating)
                </option>
                <option value="other">Other abnormal pattern</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
