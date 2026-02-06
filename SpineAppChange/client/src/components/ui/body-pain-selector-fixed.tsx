import { useState, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { RotateCw, RotateCcw } from "lucide-react";

interface PainSelection {
  bodyPart: string;
  intensity: number;
  coordinates: { x: number; y: number };
}

interface BodyPainSelectorProps {
  gender: "male" | "female";
  selectedPains: PainSelection[];
  onChange: (pains: PainSelection[]) => void;
  className?: string;
}

const BODY_PARTS = {
  head: "Head",
  neck: "Neck", 
  leftShoulder: "Left Shoulder",
  rightShoulder: "Right Shoulder",
  leftArm: "Left Arm",
  rightArm: "Right Arm",
  chest: "Chest",
  upperBack: "Upper Back",
  lowerBack: "Lower Back",
  abdomen: "Abdomen",
  leftHip: "Left Hip",
  rightHip: "Right Hip",
  leftThigh: "Left Thigh",
  rightThigh: "Right Thigh",
  leftKnee: "Left Knee",
  rightKnee: "Right Knee",
  leftCalf: "Left Calf",
  rightCalf: "Right Calf",
  leftAnkle: "Left Ankle",
  rightAnkle: "Right Ankle",
  leftFoot: "Left Foot",
  rightFoot: "Right Foot"
};

const PAIN_COLORS: Record<number, string> = {
  1: "#FEF3C7", // Very light yellow
  2: "#FDE68A", // Light yellow
  3: "#FCD34D", // Yellow
  4: "#F59E0B", // Orange
  5: "#EF4444", // Red
  6: "#DC2626", // Dark red
  7: "#B91C1C", // Darker red
  8: "#991B1B", // Very dark red
  9: "#7F1D1D", // Deep red
  10: "#450A0A"  // Darkest red
};

export function BodyPainSelectorFixed({ gender, selectedPains, onChange, className }: BodyPainSelectorProps) {
  const [isBackView, setIsBackView] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState(5);

  const handleBodyPartClick = useCallback((bodyPart: string, x: number, y: number, event?: React.MouseEvent) => {
    // CRITICAL: Prevent any form submission when clicking body parts
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    const existing = selectedPains.find(p => p.bodyPart === bodyPart);
    
    if (existing) {
      // Remove if clicking on already selected part
      onChange(selectedPains.filter(p => p.bodyPart !== bodyPart));
    } else {
      // Add new pain selection with safe coordinates
      onChange([...selectedPains, {
        bodyPart,
        intensity: selectedIntensity,
        coordinates: { x: x || 0, y: y || 0 }
      }]);
    }
  }, [selectedPains, selectedIntensity, onChange]);

  const getPainColor = (bodyPart: string) => {
    const pain = selectedPains.find(p => p.bodyPart === bodyPart);
    return pain ? PAIN_COLORS[pain.intensity] : "transparent";
  };

  const handleIntensityClick = (level: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedIntensity(level);
  };

  const handleRotateClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsBackView(!isBackView);
  };

  return (
    <div className={cn("space-y-4", className)} onMouseDown={(e) => e.preventDefault()}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Pain Intensity:</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <button
                key={level}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleIntensityClick(level, e)}
                className={cn(
                  "w-6 h-6 rounded-full border text-xs font-medium",
                  selectedIntensity === level 
                    ? "border-gray-800 text-white" 
                    : "border-gray-300 text-gray-600"
                )}
                style={{
                  backgroundColor: selectedIntensity === level ? PAIN_COLORS[level] : "white"
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {isBackView ? "Back View" : "Front View"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRotateClick}
            className="flex items-center space-x-1"
          >
            {isBackView ? <RotateCcw className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
            <span>Rotate</span>
          </Button>
        </div>
      </div>

      {/* Body Model */}
      <div className="relative bg-gray-50 rounded-xl p-8 flex justify-center">
        <svg
          width="300"
          height="500"
          viewBox="0 0 300 500"
          className="cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
        >
          {!isBackView ? (
            // Front View
            <g>
              {/* Head */}
              <ellipse
                cx="150"
                cy="40"
                rx="25"
                ry="30"
                fill={getPainColor("head")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("head", 150, 40, e)}
              />
              
              {/* Neck */}
              <rect
                x="140"
                y="65"
                width="20"
                height="20"
                fill={getPainColor("neck")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("neck", 150, 75, e)}
              />
              
              {/* Shoulders */}
              <ellipse
                cx="120"
                cy="95"
                rx="15"
                ry="12"
                fill={getPainColor("leftShoulder")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftShoulder", 120, 95, e)}
              />
              <ellipse
                cx="180"
                cy="95"
                rx="15"
                ry="12"
                fill={getPainColor("rightShoulder")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightShoulder", 180, 95, e)}
              />

              {/* Arms */}
              <rect
                x="95"
                y="100"
                width="15"
                height="60"
                fill={getPainColor("leftArm")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftArm", 102, 130, e)}
              />
              <rect
                x="190"
                y="100"
                width="15"
                height="60"
                fill={getPainColor("rightArm")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightArm", 197, 130, e)}
              />

              {/* Torso */}
              <rect
                x="130"
                y="85"
                width="40"
                height="50"
                fill={getPainColor("chest")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("chest", 150, 110, e)}
              />
              <rect
                x="130"
                y="135"
                width="40"
                height="60"
                fill={getPainColor("abdomen")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("abdomen", 150, 165, e)}
              />

              {/* Hips */}
              <ellipse
                cx="135"
                cy="210"
                rx="12"
                ry="15"
                fill={getPainColor("leftHip")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftHip", 135, 210, e)}
              />
              <ellipse
                cx="165"
                cy="210"
                rx="12"
                ry="15"
                fill={getPainColor("rightHip")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightHip", 165, 210, e)}
              />

              {/* Thighs */}
              <rect
                x="128"
                y="225"
                width="18"
                height="70"
                fill={getPainColor("leftThigh")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftThigh", 137, 260, e)}
              />
              <rect
                x="154"
                y="225"
                width="18"
                height="70"
                fill={getPainColor("rightThigh")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightThigh", 163, 260, e)}
              />

              {/* Knees */}
              <ellipse
                cx="137"
                cy="305"
                rx="10"
                ry="8"
                fill={getPainColor("leftKnee")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftKnee", 137, 305, e)}
              />
              <ellipse
                cx="163"
                cy="305"
                rx="10"
                ry="8"
                fill={getPainColor("rightKnee")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightKnee", 163, 305, e)}
              />

              {/* Calves */}
              <rect
                x="130"
                y="315"
                width="14"
                height="70"
                fill={getPainColor("leftCalf")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftCalf", 137, 350, e)}
              />
              <rect
                x="156"
                y="315"
                width="14"
                height="70"
                fill={getPainColor("rightCalf")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightCalf", 163, 350, e)}
              />

              {/* Ankles & Feet */}
              <ellipse
                cx="137"
                cy="395"
                rx="8"
                ry="6"
                fill={getPainColor("leftAnkle")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftAnkle", 137, 395, e)}
              />
              <ellipse
                cx="163"
                cy="395"
                rx="8"
                ry="6"
                fill={getPainColor("rightAnkle")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightAnkle", 163, 395, e)}
              />
              <ellipse
                cx="137"
                cy="420"
                rx="12"
                ry="20"
                fill={getPainColor("leftFoot")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftFoot", 137, 420, e)}
              />
              <ellipse
                cx="163"
                cy="420"
                rx="12"
                ry="20"
                fill={getPainColor("rightFoot")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightFoot", 163, 420, e)}
              />
            </g>
          ) : (
            // Back View
            <g>
              {/* Head - back */}
              <ellipse
                cx="150"
                cy="40"
                rx="25"
                ry="30"
                fill={getPainColor("head")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("head", 150, 40, e)}
              />
              
              {/* Neck - back */}
              <rect
                x="140"
                y="65"
                width="20"
                height="20"
                fill={getPainColor("neck")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("neck", 150, 75, e)}
              />
              
              {/* Upper Back */}
              <rect
                x="130"
                y="85"
                width="40"
                height="50"
                fill={getPainColor("upperBack")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("upperBack", 150, 110, e)}
              />
              
              {/* Lower Back */}
              <rect
                x="130"
                y="135"
                width="40"
                height="60"
                fill={getPainColor("lowerBack")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("lowerBack", 150, 165, e)}
              />
              
              {/* Back view arms, legs etc. - mirrored positions */}
              <rect
                x="95"
                y="100"
                width="15"
                height="60"
                fill={getPainColor("rightArm")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("rightArm", 102, 130, e)}
              />
              <rect
                x="190"
                y="100"
                width="15"
                height="60"
                fill={getPainColor("leftArm")}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-75"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleBodyPartClick("leftArm", 197, 130, e)}
              />
            </g>
          )}
          
          {/* Pain intensity indicators */}
          {selectedPains.map((pain, index) => (
            <g key={`${pain.bodyPart}-${index}`}>
              <circle
                cx={pain.coordinates.x + 20}
                cy={pain.coordinates.y - 10}
                r="8"
                fill={PAIN_COLORS[pain.intensity]}
                stroke="#374151"
                strokeWidth="1"
              />
              <text
                x={pain.coordinates.x + 20}
                y={pain.coordinates.y - 6}
                textAnchor="middle"
                className="text-xs font-bold fill-gray-800"
              >
                {pain.intensity}
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Selected Pain Summary */}
      {selectedPains.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2">Selected Pain Areas</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {selectedPains.map((pain, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{BODY_PARTS[pain.bodyPart as keyof typeof BODY_PARTS]}</span>
                <div className="flex items-center space-x-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: PAIN_COLORS[pain.intensity] }}
                  />
                  <span className="font-medium">{pain.intensity}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}