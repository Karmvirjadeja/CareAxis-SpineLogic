import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { MedicalCheckbox } from "../../components/ui/medical-checkbox";
import { cn } from "../../lib/utils";

const waistMovementsImage =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/spine-movement.png";
const neckMovementsImage =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/neck-movement.png";

interface MovementPainData {
  [key: string]: boolean;
}

interface EnhancedRangeOfMotionProps {
  spineMovements: string[];
  neckMovements: string[];
  spineMovementPain: boolean;
  neckMovementPain: boolean;
  individualMovementPain: MovementPainData;
  onSpineMovementChange: (movements: string[]) => void;
  onNeckMovementChange: (movements: string[]) => void;
  onSpineMovementPainChange: (hasPain: boolean) => void;
  onNeckMovementPainChange: (hasPain: boolean) => void;
  onIndividualMovementPainChange: (movement: string, hasPain: boolean) => void;
  className?: string;
}

const SPINE_MOVEMENTS = [
  {
    id: "bending_forward",
    label: "Bending forward (Flexion)",
    description: "Touching toes, forward bend",
  },
  {
    id: "bending_backwards",
    label: "Bending backwards (Extension)",
    description: "Arching back, looking up",
  },
  {
    id: "bending_side",
    label: "Bending on the side (Lateral flexion)",
    description: "Leaning to left or right",
  },
  {
    id: "left_twisting",
    label: "Left twisting (Rotation)",
    description: "Turning body to the left",
  },
  {
    id: "right_twisting",
    label: "Right twisting (Rotation)",
    description: "Turning body to the right",
  },
];

const NECK_MOVEMENTS = [
  {
    id: "neck_extension",
    label: "Extension",
    description: "Looking up, tilting head back",
  },
  {
    id: "neck_flexion",
    label: "Flexion",
    description: "Looking down, chin to chest",
  },
  {
    id: "right_lateral_flexion",
    label: "Right lateral flexion",
    description: "Ear to right shoulder",
  },
  {
    id: "left_lateral_flexion",
    label: "Left lateral flexion",
    description: "Ear to left shoulder",
  },
  {
    id: "right_rotation",
    label: "Right rotation",
    description: "Turning head to the right",
  },
  {
    id: "left_rotation",
    label: "Left rotation",
    description: "Turning head to the left",
  },
];

export function EnhancedRangeOfMotion({
  spineMovements,
  neckMovements,
  spineMovementPain,
  neckMovementPain,
  individualMovementPain,
  onSpineMovementChange,
  onNeckMovementChange,
  onSpineMovementPainChange,
  onNeckMovementPainChange,
  onIndividualMovementPainChange,
  className,
}: EnhancedRangeOfMotionProps) {
  const [currentSection, setCurrentSection] = useState<"spine" | "neck">(
    "spine"
  );

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
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle> Range of Motion Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { key: "spine", label: "Spine Range of Motion" },
            { key: "neck", label: "Neck Range of Motion" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCurrentSection(key as any)}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                currentSection === key
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Movement Reference Image */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3 text-center">
            Movement Reference
          </h4>
          <div className="flex justify-center">
            <div className="relative max-w-sm bg-white rounded-lg border-2 border-blue-300 overflow-hidden shadow-lg">
              <img
                src={
                  currentSection === "spine"
                    ? waistMovementsImage
                    : neckMovementsImage
                }
                alt={`${
                  currentSection === "spine" ? "Spine" : "Neck"
                } movements reference`}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <p className="text-sm text-blue-700 text-center mt-3">
            Use this image as a reference for the movement tests.
          </p>
        </div>

        {/* Spine Range of Motion */}
        {currentSection === "spine" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                Spine Range of Motion Assessment
              </h4>
              <p className="text-sm text-blue-700">
                Test each movement and mark those that cannot be performed or
                cause significant limitation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-3">
                  Unable to perform these spine movements:
                </h5>
                <div className="grid md:grid-cols-1 gap-3">
                  {SPINE_MOVEMENTS.map((movement) => (
                    <div
                      key={movement.id}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <MedicalCheckbox
                        id={`spine-${movement.id}`}
                        label={
                          <>
                            <div className="font-medium text-gray-800">
                              {movement.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {movement.description}
                            </div>
                          </>
                        }
                        checked={spineMovements.includes(movement.id)}
                        onChange={() => toggleSpineMovement(movement.id)}
                      />

                      {spineMovements.includes(movement.id) && (
                        <div
                          className="mt-3 ml-8 p-2 bg-red-50 border border-red-200 rounded"
                          style={{ position: "relative", zIndex: 10 }}
                        >
                          <MedicalCheckbox
                            id={`spine-${movement.id}-pain`}
                            label="Causes significant pain"
                            checked={
                              individualMovementPain[movement.id] || false
                            }
                            onChange={(checked) =>
                              onIndividualMovementPainChange(
                                movement.id,
                                checked
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <MedicalCheckbox
                  id="spine-movement-pain-general"
                  label="Experiences pain during any spine movements (general)"
                  checked={spineMovementPain}
                  onChange={onSpineMovementPainChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Neck Range of Motion */}
        {currentSection === "neck" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                Neck Range of Motion Assessment
              </h4>
              <p className="text-sm text-green-700">
                Test each neck movement and mark those that cannot be performed
                or cause significant limitation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-3">
                  Unable to perform these neck movements:
                </h5>
                <div className="grid md:grid-cols-1 gap-3">
                  {NECK_MOVEMENTS.map((movement) => (
                    <div
                      key={movement.id}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <MedicalCheckbox
                        id={`6-${movement.id}`}
                        label={
                          <>
                            <div className="font-medium text-gray-800">
                              {movement.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {movement.description}
                            </div>
                          </>
                        }
                        checked={neckMovements.includes(movement.id)}
                        onChange={() => toggleNeckMovement(movement.id)}
                      />

                      {neckMovements.includes(movement.id) && (
                        <div
                          className="mt-3 ml-8 p-2 bg-red-50 border border-red-200 rounded"
                          style={{ position: "relative", zIndex: 10 }}
                        >
                          <MedicalCheckbox
                            id={`neck-${movement.id}-pain`}
                            label="Causes significant pain"
                            checked={
                              individualMovementPain[movement.id] || false
                            }
                            onChange={(checked) =>
                              onIndividualMovementPainChange(
                                movement.id,
                                checked
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <MedicalCheckbox
                  id="neck-movement-pain-general"
                  label="Experiences pain during any neck movements (general)"
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
                  {spineMovements.length} movement(s)
                  {spineMovementPain && (
                    <span className="text-red-600 ml-2">
                      (with general pain)
                    </span>
                  )}
                </div>
              )}
              {neckMovements.length > 0 && (
                <div>
                  <span className="font-medium">Neck limitations:</span>{" "}
                  {neckMovements.length} movement(s)
                  {neckMovementPain && (
                    <span className="text-red-600 ml-2">
                      (with general pain)
                    </span>
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
