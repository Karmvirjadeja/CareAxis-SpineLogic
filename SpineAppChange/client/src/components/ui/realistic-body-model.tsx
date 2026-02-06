import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RotateCcw, RotateCw } from "lucide-react";

interface BodyPart {
  id: string;
  name: string;
  coordinates: string; // SVG path or coordinates for clickable area
  intensity?: number;
}

interface RealisticBodyModelProps {
  title: string;
  selectedParts: BodyPart[];
  onPartSelect: (part: BodyPart) => void;
  onIntensityChange?: (partId: string, intensity: number) => void;
  showIntensity?: boolean;
  gender: "male" | "female";
  className?: string;
}

const bodyParts = {
  male: [
    { id: "head", name: "Head", coordinates: "M85,20 C85,10 95,5 105,5 C115,5 125,10 125,20 C125,30 115,35 105,35 C95,35 85,30 85,20 Z" },
    { id: "neck", name: "Neck", coordinates: "M100,35 L110,35 L110,50 L100,50 Z" },
    { id: "leftShoulder", name: "Left Shoulder", coordinates: "M70,50 C65,45 60,50 60,60 C60,70 70,75 80,70 L85,55 Z" },
    { id: "rightShoulder", name: "Right Shoulder", coordinates: "M125,55 L130,70 C140,75 150,70 150,60 C150,50 145,45 140,50 Z" },
    { id: "chest", name: "Chest", coordinates: "M85,55 L125,55 L120,90 L90,90 Z" },
    { id: "leftArm", name: "Left Arm", coordinates: "M60,60 L55,120 L65,125 L70,65 Z" },
    { id: "rightArm", name: "Right Arm", coordinates: "M140,65 L145,125 L155,120 L150,60 Z" },
    { id: "abdomen", name: "Abdomen", coordinates: "M90,90 L120,90 L115,130 L95,130 Z" },
    { id: "lowerBack", name: "Lower Back", coordinates: "M92,130 L118,130 L116,170 L94,170 Z" },
    { id: "leftHip", name: "Left Hip", coordinates: "M85,130 L95,130 L95,150 L85,150 Z" },
    { id: "rightHip", name: "Right Hip", coordinates: "M115,130 L125,130 L125,150 L115,150 Z" },
    { id: "leftThigh", name: "Left Thigh", coordinates: "M85,150 L95,150 L93,200 L83,200 Z" },
    { id: "rightThigh", name: "Right Thigh", coordinates: "M115,150 L125,150 L127,200 L117,200 Z" },
    { id: "leftKnee", name: "Left Knee", coordinates: "M83,200 L93,200 L91,220 L81,220 Z" },
    { id: "rightKnee", name: "Right Knee", coordinates: "M117,200 L127,200 L129,220 L119,220 Z" },
    { id: "leftCalf", name: "Left Calf", coordinates: "M81,220 L91,220 L89,270 L79,270 Z" },
    { id: "rightCalf", name: "Right Calf", coordinates: "M119,220 L129,220 L131,270 L121,270 Z" },
    { id: "leftFoot", name: "Left Foot", coordinates: "M75,270 L89,270 L90,285 L75,285 Z" },
    { id: "rightFoot", name: "Right Foot", coordinates: "M121,270 L135,270 L135,285 L120,285 Z" }
  ],
  female: [
    { id: "head", name: "Head", coordinates: "M85,20 C85,10 95,5 105,5 C115,5 125,10 125,20 C125,30 115,35 105,35 C95,35 85,30 85,20 Z" },
    { id: "neck", name: "Neck", coordinates: "M100,35 L110,35 L110,50 L100,50 Z" },
    { id: "leftShoulder", name: "Left Shoulder", coordinates: "M70,50 C65,45 60,50 60,60 C60,70 70,75 80,70 L85,55 Z" },
    { id: "rightShoulder", name: "Right Shoulder", coordinates: "M125,55 L130,70 C140,75 150,70 150,60 C150,50 145,45 140,50 Z" },
    { id: "chest", name: "Chest", coordinates: "M85,55 L125,55 L122,95 L88,95 Z" },
    { id: "leftArm", name: "Left Arm", coordinates: "M60,60 L55,120 L65,125 L70,65 Z" },
    { id: "rightArm", name: "Right Arm", coordinates: "M140,65 L145,125 L155,120 L150,60 Z" },
    { id: "abdomen", name: "Abdomen", coordinates: "M88,95 L122,95 L118,135 L92,135 Z" },
    { id: "lowerBack", name: "Lower Back", coordinates: "M92,135 L118,135 L116,175 L94,175 Z" },
    { id: "leftHip", name: "Left Hip", coordinates: "M82,135 L95,135 L95,155 L82,155 Z" },
    { id: "rightHip", name: "Right Hip", coordinates: "M115,135 L128,135 L128,155 L115,155 Z" },
    { id: "leftThigh", name: "Left Thigh", coordinates: "M82,155 L95,155 L93,205 L80,205 Z" },
    { id: "rightThigh", name: "Right Thigh", coordinates: "M115,155 L128,155 L130,205 L117,205 Z" },
    { id: "leftKnee", name: "Left Knee", coordinates: "M80,205 L93,205 L91,225 L78,225 Z" },
    { id: "rightKnee", name: "Right Knee", coordinates: "M117,205 L130,205 L132,225 L119,225 Z" },
    { id: "leftCalf", name: "Left Calf", coordinates: "M78,225 L91,225 L89,275 L76,275 Z" },
    { id: "rightCalf", name: "Right Calf", coordinates: "M119,225 L132,225 L134,275 L121,275 Z" },
    { id: "leftFoot", name: "Left Foot", coordinates: "M72,275 L89,275 L90,290 L72,290 Z" },
    { id: "rightFoot", name: "Right Foot", coordinates: "M121,275 L138,275 L138,290 L120,290 Z" }
  ]
};

export function RealisticBodyModel({
  title,
  selectedParts,
  onPartSelect,
  onIntensityChange,
  showIntensity = true,
  gender,
  className = ""
}: RealisticBodyModelProps) {
  const [view, setView] = useState<"front" | "side" | "back">("front");
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const currentBodyParts = bodyParts[gender];

  const getPartColor = (partId: string) => {
    const selected = selectedParts.find(p => p.id === partId);
    if (!selected) return "transparent";
    
    if (showIntensity && selected.intensity) {
      const intensity = selected.intensity;
      if (intensity <= 3) return "rgba(255, 235, 59, 0.6)"; // Yellow for mild
      if (intensity <= 6) return "rgba(255, 152, 0, 0.7)"; // Orange for moderate  
      return "rgba(244, 67, 54, 0.8)"; // Red for severe
    }
    
    return "rgba(33, 150, 243, 0.6)"; // Blue for selected
  };

  const handlePartClick = (part: BodyPart) => {
    const isSelected = selectedParts.some(p => p.id === part.id);
    if (isSelected) {
      // If already selected, remove it
      onPartSelect({ ...part, intensity: 0 });
    } else {
      // Add new selection with default intensity
      onPartSelect({ ...part, intensity: showIntensity ? 5 : undefined });
    }
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return "Mild";
    if (intensity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <Card className={`medical-card ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === "front" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("front")}
            >
              Front
            </Button>
            <Button
              variant={view === "side" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("side")}
            >
              Side
            </Button>
            <Button
              variant={view === "back" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("back")}
            >
              Back
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 3D Body Model */}
          <div className="flex-1">
            <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <svg
                viewBox="0 0 210 300"
                className="w-full h-full max-w-[300px] max-h-[400px]"
                style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))" }}
              >
                {/* Body outline based on gender and view */}
                {view === "front" && (
                  <g>
                    {/* Realistic body outline for front view */}
                    <path
                      d={gender === "male" 
                        ? "M105,5 C115,5 125,10 125,20 C125,30 115,35 110,35 L110,50 L150,50 C155,55 155,65 150,70 L145,125 L155,125 L150,60 C150,50 145,45 140,50 L125,55 L125,90 L120,90 L115,130 L125,130 L125,150 L127,200 L129,220 L131,270 L135,270 L135,285 L120,285 L121,270 L119,220 L117,200 L115,150 L95,150 L93,200 L91,220 L89,270 L90,285 L75,285 L75,270 L79,270 L81,220 L83,200 L85,150 L85,130 L95,130 L90,90 L85,55 L70,50 C65,45 60,50 60,60 C60,70 70,75 80,70 L85,55 L100,35 C95,35 85,30 85,20 C85,10 95,5 105,5 Z"
                        : "M105,5 C115,5 125,10 125,20 C125,30 115,35 110,35 L110,50 L150,50 C155,55 155,65 150,70 L145,125 L155,125 L150,60 C150,50 145,45 140,50 L125,55 L122,95 L118,135 L128,135 L128,155 L130,205 L132,225 L134,275 L138,275 L138,290 L120,290 L121,275 L119,225 L117,205 L115,155 L95,155 L93,205 L91,225 L89,275 L90,290 L72,290 L72,275 L76,275 L78,225 L80,205 L82,155 L82,135 L92,135 L88,95 L85,55 L70,50 C65,45 60,50 60,60 C60,70 70,75 80,70 L85,55 L100,35 C95,35 85,30 85,20 C85,10 95,5 105,5 Z"
                      }
                      fill="#f5f5f5"
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                    
                    {/* Body parts as clickable areas */}
                    {currentBodyParts.map((part) => (
                      <path
                        key={part.id}
                        d={part.coordinates}
                        fill={getPartColor(part.id)}
                        stroke={hoveredPart === part.id ? "#2196F3" : "transparent"}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200 hover:stroke-blue-500"
                        onMouseEnter={() => setHoveredPart(part.id)}
                        onMouseLeave={() => setHoveredPart(null)}
                        onClick={() => handlePartClick(part)}
                      />
                    ))}
                  </g>
                )}
                
                {view === "side" && (
                  <g>
                    {/* Side view body outline */}
                    <path
                      d="M105,5 C115,5 125,10 125,20 C125,30 118,35 115,50 L120,70 L125,125 L130,60 L135,125 L140,270 L145,285 L130,285 L125,270 L120,220 L115,200 L110,150 L105,130 L100,90 L95,55 L90,50 C85,35 85,30 85,20 C85,10 95,5 105,5 Z"
                      fill="#f5f5f5"
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                  </g>
                )}
                
                {view === "back" && (
                  <g>
                    {/* Back view body outline */}
                    <path
                      d="M105,5 C115,5 125,10 125,20 C125,30 115,35 110,35 L110,50 L150,50 C155,55 155,65 150,70 L145,125 L155,125 L150,60 C150,50 145,45 140,50 L125,55 L120,90 L115,130 L125,130 L125,150 L127,200 L129,220 L131,270 L135,270 L135,285 L120,285 L121,270 L119,220 L117,200 L115,150 L95,150 L93,200 L91,220 L89,270 L90,285 L75,285 L75,270 L79,270 L81,220 L83,200 L85,150 L85,130 L95,130 L90,90 L85,55 L70,50 C65,45 60,50 60,60 C60,70 70,75 80,70 L85,55 L100,35 C95,35 85,30 85,20 C85,10 95,5 105,5 Z"
                      fill="#f5f5f5"
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                    
                    {/* Spine indication for back view */}
                    <line x1="105" y1="35" x2="105" y2="150" stroke="#ccc" strokeWidth="2" strokeDasharray="2,2" />
                  </g>
                )}
                
                {/* Hover tooltip */}
                {hoveredPart && (
                  <text
                    x="105"
                    y="15"
                    textAnchor="middle"
                    className="fill-gray-700 text-sm font-medium"
                  >
                    {currentBodyParts.find(p => p.id === hoveredPart)?.name}
                  </text>
                )}
              </svg>
            </div>
          </div>

          {/* Selected Parts Panel */}
          <div className="w-full lg:w-80">
            <h4 className="font-medium text-gray-900 mb-3">Selected Areas</h4>
            
            {selectedParts.length === 0 ? (
              <p className="text-gray-500 text-sm">Click on body parts to select areas of pain or concern.</p>
            ) : (
              <div className="space-y-3">
                {selectedParts.map((part) => (
                  <div key={part.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{part.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => onPartSelect({ ...part, intensity: 0 })}
                      >
                        ×
                      </Button>
                    </div>
                    
                    {showIntensity && onIntensityChange && part.intensity && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Pain Level: {getIntensityLabel(part.intensity)}</span>
                          <span>{part.intensity}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={part.intensity}
                          onChange={(e) => onIntensityChange(part.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #ffeb3b 0%, #ff9800 50%, #f44336 100%)`
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {showIntensity && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-sm text-blue-900 mb-2">Pain Scale</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span>1-3: Mild pain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-400 rounded"></div>
                    <span>4-6: Moderate pain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span>7-10: Severe pain</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}