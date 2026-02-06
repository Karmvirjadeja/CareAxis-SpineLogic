import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { MedicalCheckbox } from "../../components/ui/medical-checkbox";
import { VideoDemonstration } from "../../components/ui/video-demonstration";
import { cn } from "../../lib/utils";

const antalgicGaitVideo =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/Antalgic Gait_1756619643037.mov";
const crouchedGaitVideo =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/crouched gait_1756619643035.mov";
const listedGaitVideo =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/Listed gait_1756619643033.mov";
const lurchingGaitVideo =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/Trendelenberg_lurching gait.mp4";

interface GaitAssessmentValues {
  canWalkOnRightToe: boolean;
  canWalkOnLeftToe: boolean;
  canWalkOnRightHeel: boolean;
  canWalkOnLeftHeel: boolean;
  gaitPattern: string;
  usesWalkingAid: boolean;
  walkingAidType: string;
  listedSide: string; // This field was in the interface but not used in the UI
  listedPainRelation: string; // This field was also unused
}

interface EnhancedGaitAssessmentProps {
  values: GaitAssessmentValues;
  onChange: (field: keyof GaitAssessmentValues, value: any) => void;
  className?: string;
}

// Data for gait patterns is defined once and reused
const gaitPatterns = [
  {
    type: "antalgic",
    title: "Antalgic Gait",
    description:
      "Limping gait due to pain, with shortened stance phase on affected leg.",
    videoSrc: antalgicGaitVideo,
  },
  {
    type: "lurching",
    title: "Lurching/Trendelenburg Gait",
    description: "Hip dropping due to weakness of hip abductors.",
    videoSrc: lurchingGaitVideo,
  },
  {
    type: "crouched",
    title: "Crouched Gait",
    description: "Walking with knees constantly bent, often due to spasticity.",
    videoSrc: crouchedGaitVideo,
  },
  {
    type: "listed",
    title: "Listed Gait",
    description: "Body consistently leans to one side while walking.",
    videoSrc: listedGaitVideo,
  },
];

const navigationTabs = [
  { key: "basic", label: "Basic Tests" },
  { key: "patterns", label: "Gait Patterns" },
  { key: "aids", label: "Walking Aids" },
] as const; // Using "as const" for better type inference

type Section = (typeof navigationTabs)[number]["key"];

export function EnhancedGaitAssessment({
  values,
  onChange,
  className,
}: EnhancedGaitAssessmentProps) {
  const [currentSection, setCurrentSection] = useState<Section>("basic");

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Enhanced Gait Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {navigationTabs.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => setCurrentSection(key)}
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

        {/* Basic Gait Tests */}
        {currentSection === "basic" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-4 text-blue-700">
                Heel-Toe Walking Assessment
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Toe Walking</h5>
                  <MedicalCheckbox
                    id="canWalkRightToe"
                    label="Can walk on right toe"
                    checked={values.canWalkOnRightToe}
                    onChange={(checked) =>
                      onChange("canWalkOnRightToe", checked)
                    }
                  />
                  <MedicalCheckbox
                    id="canWalkLeftToe"
                    label="Can walk on left toe"
                    checked={values.canWalkOnLeftToe}
                    onChange={(checked) =>
                      onChange("canWalkOnLeftToe", checked)
                    }
                  />
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Heel Walking</h5>
                  <MedicalCheckbox
                    id="canWalkRightHeel"
                    label="Can walk on right heel"
                    checked={values.canWalkOnRightHeel}
                    onChange={(checked) =>
                      onChange("canWalkOnRightHeel", checked)
                    }
                  />
                  <MedicalCheckbox
                    id="canWalkLeftHeel"
                    label="Can walk on left heel"
                    checked={values.canWalkOnLeftHeel}
                    onChange={(checked) =>
                      onChange("canWalkOnLeftHeel", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gait Patterns with Video Demonstrations */}
        {currentSection === "patterns" && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Observed Gait Pattern
              </h4>
              <p className="text-sm text-yellow-700 mb-4">
                Select the observed gait pattern. Use the video demonstrations
                below for reference.
              </p>
              <Select
                value={values.gaitPattern || ""}
                onValueChange={(value) => onChange("gaitPattern", value)}
              >
                <SelectTrigger className="medical-input">
                  <SelectValue placeholder="Select a gait pattern" />
                </SelectTrigger>
                <SelectContent>
                  {gaitPatterns.map((pattern) => (
                    <SelectItem key={pattern.type} value={pattern.title}>
                      {pattern.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional section for Listed Gait details */}
            {values.gaitPattern === "Listed Gait" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-3">
                  Listed Gait Details
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Side of List
                    </label>
                    <Select
                      value={values.listedSide || ""}
                      onValueChange={(value) => onChange("listedSide", value)}
                    >
                      <SelectTrigger className="medical-input">
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relation to Pain
                    </label>
                    <Select
                      value={values.listedPainRelation || ""}
                      onValueChange={(value) =>
                        onChange("listedPainRelation", value)
                      }
                    >
                      <SelectTrigger className="medical-input">
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="away">
                          Away from painful side
                        </SelectItem>
                        <SelectItem value="towards">
                          Towards painful side
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {gaitPatterns.map((pattern) => (
                <div
                  key={pattern.type}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <VideoDemonstration
                    title={pattern.title}
                    description={pattern.description}
                    videoSrc={pattern.videoSrc}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Walking Aids */}
        {currentSection === "aids" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold mb-4 text-green-700">
                Walking Aid Assessment
              </h4>
              <div className="space-y-4">
                <MedicalCheckbox
                  id="usesWalkingAid"
                  label="Do you use a walker or stick to walk?"
                  checked={values.usesWalkingAid}
                  onChange={(checked) => onChange("usesWalkingAid", checked)}
                />
                {values.usesWalkingAid && (
                  <div className="ml-6 mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of walking aid
                    </label>
                    <Select
                      value={values.walkingAidType || ""}
                      onValueChange={(value) =>
                        onChange("walkingAidType", value)
                      }
                    >
                      <SelectTrigger className="medical-input max-w-xs">
                        <SelectValue placeholder="Select walking aid type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walking_stick">
                          Walking stick/cane
                        </SelectItem>
                        <SelectItem value="walker">Walker/rollator</SelectItem>
                        <SelectItem value="crutches">Crutches</SelectItem>
                        <SelectItem value="quad_cane">Quad cane</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
