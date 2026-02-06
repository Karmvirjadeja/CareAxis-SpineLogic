import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { MedicalCheckbox } from "../../components/ui/medical-checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/utils";

// Import reference image
const legRaiseImage =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/Leg Raise.png";

interface StraightLegRaiseValues {
  activeTest?: {
    rightLeg: {
      canPerform: boolean;
      limitedByPain: boolean;
      maxAngle: number;
    };
    leftLeg: {
      canPerform: boolean;
      limitedByPain: boolean;
      maxAngle: number;
    };
  };
  passiveTest?: {
    rightLeg: {
      canPerform: boolean;
      limitedByPain: boolean;
      maxAngle: number;
    };
    leftLeg: {
      canPerform: boolean;
      limitedByPain: boolean;
      maxAngle: number;
    };
  };
}

interface StraightLegRaiseTestProps {
  values: StraightLegRaiseValues;
  onChange: (field: string, value: any) => void;
  className?: string;
}

export function StraightLegRaiseTest({
  values,
  onChange,
  className,
}: StraightLegRaiseTestProps) {
  const [currentTest, setCurrentTest] = useState<"active" | "passive">(
    "active"
  );

  const updateTestValue = (
    testType: "active" | "passive",
    leg: "rightLeg" | "leftLeg",
    field: string,
    value: any
  ) => {
    const testKey = testType === "active" ? "activeTest" : "passiveTest";
    onChange("straightLegRaisingTest", {
      ...values,
      [testKey]: {
        ...(values?.[testKey] || {}),
        [leg]: {
          ...(values?.[testKey]?.[leg] || {}),
          [field]: value,
        },
      },
    });
  };

  const renderLegTest = (
    testType: "active" | "passive",
    leg: "rightLeg" | "leftLeg",
    legLabel: string
  ) => {
    const testKey = testType === "active" ? "activeTest" : "passiveTest";
    const testData = values?.[testKey]?.[leg] || {
      canPerform: false,
      limitedByPain: false,
      maxAngle: 0,
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h5 className="font-medium text-gray-800 mb-3">{legLabel} Leg</h5>

        <div className="space-y-3">
          <MedicalCheckbox
            id={`${testType}-${leg}-can-perform`}
            label="Can perform test"
            checked={testData.canPerform}
            onChange={(checked) =>
              updateTestValue(testType, leg, "canPerform", checked)
            }
          />

          {testData.canPerform && (
            <>
              <MedicalCheckbox
                id={`${testType}-${leg}-pain`}
                label="Limited by pain"
                checked={testData.limitedByPain}
                onChange={(checked) =>
                  updateTestValue(testType, leg, "limitedByPain", checked)
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum angle achieved (degrees)
                </label>
                <Select
                  value={testData.maxAngle?.toString() || "0"}
                  onValueChange={(value) =>
                    updateTestValue(testType, leg, "maxAngle", parseInt(value))
                  }
                >
                  <SelectTrigger className="medical-input">
                    <SelectValue placeholder="Select angle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => (i + 1) * 10).map(
                      (angle) => (
                        <SelectItem key={angle} value={angle.toString()}>
                          {angle}°{" "}
                          {angle >= 70
                            ? "(Normal)"
                            : angle >= 30
                            ? "(Limited)"
                            : "(Severely Limited)"}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Functional Tests</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { key: "active", label: "Passive Test (Assisted)" },
            {
              key: "passive",
              label: "Active Test (Self)",
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCurrentTest(key as any)}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                currentTest === key
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Active Test */}
        {currentTest === "active" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                Passive Straight Leg Raise
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                Examiner slowly raises the patient's leg from 0 to 70 degrees
                while the patient remains relaxed. Mark as "limited by pain" if
                pain occurs before reaching 70 degrees.
              </p>
              <div className="flex justify-center">
                <img
                  src={legRaiseImage}
                  alt="Straight Leg Raise Reference"
                  className="rounded-lg shadow-md max-w-xs w-full"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {renderLegTest("passive", "rightLeg", "Right")}
              {renderLegTest("passive", "leftLeg", "Left")}
            </div>
          </div>
        )}

        {/* Passive Test */}
        {currentTest === "passive" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                Active Straight Leg Raise
              </h4>
              <p className="text-sm text-green-700">
                Patient performs the test by lying on their back and asking
                someone else to raise each leg individually while keeping the
                knee straight. Use the image below for reference.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {renderLegTest("active", "rightLeg", "Right")}
              {renderLegTest("active", "leftLeg", "Left")}
            </div>
          </div>
        )}

        {/* Test Summary */}
        {(values?.activeTest?.rightLeg?.canPerform ||
          values?.activeTest?.leftLeg?.canPerform ||
          values?.passiveTest?.rightLeg?.canPerform ||
          values?.passiveTest?.leftLeg?.canPerform) && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-medium text-yellow-800 mb-2">Test Summary</h5>
            <div className="text-sm space-y-1">
              {values.activeTest?.rightLeg?.canPerform && (
                <div>
                  <span className="font-medium">Active Right:</span>{" "}
                  {values.activeTest.rightLeg.maxAngle}°
                  {values.activeTest.rightLeg.limitedByPain && (
                    <span className="text-red-600 ml-2">(limited by pain)</span>
                  )}
                </div>
              )}
              {values.activeTest?.leftLeg?.canPerform && (
                <div>
                  <span className="font-medium">Active Left:</span>{" "}
                  {values.activeTest.leftLeg.maxAngle}°
                  {values.activeTest.leftLeg.limitedByPain && (
                    <span className="text-red-600 ml-2">(limited by pain)</span>
                  )}
                </div>
              )}
              {values.passiveTest?.rightLeg?.canPerform && (
                <div>
                  <span className="font-medium">Passive Right:</span>{" "}
                  {values.passiveTest.rightLeg.maxAngle}°
                  {values.passiveTest.rightLeg.limitedByPain && (
                    <span className="text-red-600 ml-2">(limited by pain)</span>
                  )}
                </div>
              )}
              {values.passiveTest?.leftLeg?.canPerform && (
                <div>
                  <span className="font-medium">Passive Left:</span>{" "}
                  {values.passiveTest.leftLeg.maxAngle}°
                  {values.passiveTest.leftLeg.limitedByPain && (
                    <span className="text-red-600 ml-2">(limited by pain)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
