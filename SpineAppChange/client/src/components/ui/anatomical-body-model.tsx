import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RotateCcw, RotateCw, User, Users } from "lucide-react";

interface BodyPart {
  id: string;
  name: string;
  intensity?: number;
}

interface AnatomicalBodyModelProps {
  title: string;
  selectedParts: BodyPart[];
  onPartSelect: (part: BodyPart) => void;
  onIntensityChange?: (partId: string, intensity: number) => void;
  showIntensity?: boolean;
  gender: "male" | "female";
  className?: string;
}

export function AnatomicalBodyModel({
  title,
  selectedParts,
  onPartSelect,
  onIntensityChange,
  showIntensity = true,
  gender,
  className = ""
}: AnatomicalBodyModelProps) {
  const [currentView, setCurrentView] = useState<"front" | "back" | "side">("front");
  const [currentGender, setCurrentGender] = useState<"male" | "female">(gender);

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return "transparent";
    switch (intensity) {
      case 1: return "#FEF3C7"; // yellow-100
      case 2: return "#FCD34D"; // yellow-400
      case 3: return "#F59E0B"; // yellow-500
      case 4: return "#EA580C"; // orange-600
      case 5: return "#DC2626"; // red-600
      default: return "transparent";
    }
  };

  const isPartSelected = (partId: string) => {
    return selectedParts.some(part => part.id === partId);
  };

  const getPartIntensity = (partId: string) => {
    return selectedParts.find(part => part.id === partId)?.intensity || 0;
  };

  const handlePartClick = (partId: string, partName: string) => {
    onPartSelect({ id: partId, name: partName });
  };

  const BodyPartButton = ({ id, name, style }: { id: string; name: string; style: React.CSSProperties }) => (
    <button
      onClick={() => handlePartClick(id, name)}
      className="absolute hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      style={{
        ...style,
        backgroundColor: getIntensityColor(getPartIntensity(id)),
        border: isPartSelected(id) ? "2px solid #3B82F6" : "1px solid transparent",
      }}
      title={name}
    />
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex gap-2">
            <Button
              variant={currentGender === "male" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentGender("male")}
            >
              <User className="w-4 h-4 mr-1" />
              Male
            </Button>
            <Button
              variant={currentGender === "female" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentGender("female")}
            >
              <Users className="w-4 h-4 mr-1" />
              Female
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* View Controls */}
          <div className="flex justify-center space-x-2">
            {["front", "back", "side"].map((view) => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView(view as any)}
                className="capitalize"
              >
                {view}
              </Button>
            ))}
          </div>

          {/* Body Model Display */}
          <div className="flex justify-center">
            <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-8 shadow-inner">
              {currentView === "front" && (
                <svg width="200" height="400" viewBox="0 0 200 400" className="border rounded-lg bg-white shadow">
                  <defs>
                    <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fdf2f8" />
                      <stop offset="50%" stopColor="#fce7f3" />
                      <stop offset="100%" stopColor="#fbcfe8" />
                    </linearGradient>
                    <radialGradient id="muscleTone" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f9fafb" />
                      <stop offset="100%" stopColor="#e5e7eb" />
                    </radialGradient>
                  </defs>

                  {/* Head */}
                  <g>
                    <ellipse cx="100" cy="35" rx="25" ry="30" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="head" 
                      name="Head" 
                      style={{ left: '37.5%', top: '1%', width: '25%', height: '18%', borderRadius: '50%' }} 
                    />
                    {/* Facial features */}
                    <circle cx="90" cy="30" r="2" fill="#374151"/>
                    <circle cx="110" cy="30" r="2" fill="#374151"/>
                    <path d="M95 40 Q100 45 105 40" stroke="#6b7280" strokeWidth="1" fill="none"/>
                  </g>

                  {/* Neck */}
                  <g>
                    <rect x="85" y="65" width="30" height="25" rx="8" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="neck" 
                      name="Neck" 
                      style={{ left: '42.5%', top: '16%', width: '15%', height: '6%', borderRadius: '8px' }} 
                    />
                  </g>

                  {/* Shoulders */}
                  <g>
                    <ellipse cx="65" cy="105" rx="20" ry="15" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <ellipse cx="135" cy="105" rx="20" ry="15" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftShoulder" 
                      name="Left Shoulder" 
                      style={{ left: '22.5%', top: '22%', width: '20%', height: '8%', borderRadius: '50%' }} 
                    />
                    <BodyPartButton 
                      id="rightShoulder" 
                      name="Right Shoulder" 
                      style={{ left: '57.5%', top: '22%', width: '20%', height: '8%', borderRadius: '50%' }} 
                    />
                  </g>

                  {/* Arms */}
                  <g>
                    <rect x="25" y="120" width="25" height="80" rx="12" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <rect x="150" y="120" width="25" height="80" rx="12" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftArm" 
                      name="Left Arm" 
                      style={{ left: '12.5%', top: '30%', width: '12.5%', height: '20%', borderRadius: '12px' }} 
                    />
                    <BodyPartButton 
                      id="rightArm" 
                      name="Right Arm" 
                      style={{ left: '75%', top: '30%', width: '12.5%', height: '20%', borderRadius: '12px' }} 
                    />
                  </g>

                  {/* Chest/Torso */}
                  <g>
                    <path d="M70 90 Q100 85 130 90 L125 160 Q100 165 75 160 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="chest" 
                      name="Chest" 
                      style={{ left: '35%', top: '22%', width: '30%', height: '18%', borderRadius: '8px' }} 
                    />
                    {/* Ribcage definition */}
                    <path d="M85 100 Q100 95 115 100" stroke="#d1d5db" strokeWidth="0.5" fill="none" opacity="0.5"/>
                    <path d="M85 115 Q100 110 115 115" stroke="#d1d5db" strokeWidth="0.5" fill="none" opacity="0.5"/>
                    <path d="M85 130 Q100 125 115 130" stroke="#d1d5db" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  </g>

                  {/* Abdomen */}
                  <g>
                    <path d="M75 160 Q100 155 125 160 L120 220 Q100 225 80 220 Z" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="abdomen" 
                      name="Abdomen" 
                      style={{ left: '37.5%', top: '40%', width: '25%', height: '15%', borderRadius: '8px' }} 
                    />
                    {/* Abdominal muscle definition */}
                    <line x1="100" y1="170" x2="100" y2="210" stroke="#d1d5db" strokeWidth="0.5" opacity="0.5"/>
                    <line x1="90" y1="180" x2="110" y2="180" stroke="#d1d5db" strokeWidth="0.5" opacity="0.5"/>
                    <line x1="90" y1="200" x2="110" y2="200" stroke="#d1d5db" strokeWidth="0.5" opacity="0.5"/>
                  </g>

                  {/* Lower Back/Hip Area */}
                  <g>
                    <path d="M80 220 Q100 215 120 220 L115 250 Q100 255 85 250 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="lowerBack" 
                      name="Lower Back" 
                      style={{ left: '40%', top: '55%', width: '20%', height: '8%', borderRadius: '8px' }} 
                    />
                  </g>

                  {/* Hips */}
                  <g>
                    <ellipse cx="80" cy="260" rx="15" ry="20" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <ellipse cx="120" cy="260" rx="15" ry="20" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftHip" 
                      name="Left Hip" 
                      style={{ left: '32.5%', top: '60%', width: '15%', height: '10%', borderRadius: '50%' }} 
                    />
                    <BodyPartButton 
                      id="rightHip" 
                      name="Right Hip" 
                      style={{ left: '52.5%', top: '60%', width: '15%', height: '10%', borderRadius: '50%' }} 
                    />
                  </g>

                  {/* Thighs */}
                  <g>
                    <path d="M65 280 Q80 275 85 290 L80 330 Q75 335 70 330 L65 290 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <path d="M115 290 Q120 275 135 280 L130 330 Q125 335 120 330 L115 290 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftThigh" 
                      name="Left Thigh" 
                      style={{ left: '32.5%', top: '70%', width: '10%', height: '15%', borderRadius: '12px' }} 
                    />
                    <BodyPartButton 
                      id="rightThigh" 
                      name="Right Thigh" 
                      style={{ left: '57.5%', top: '70%', width: '10%', height: '15%', borderRadius: '12px' }} 
                    />
                  </g>

                  {/* Knees */}
                  <g>
                    <ellipse cx="75" cy="340" rx="8" ry="12" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <ellipse cx="125" cy="340" rx="8" ry="12" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftKnee" 
                      name="Left Knee" 
                      style={{ left: '33.5%', top: '82%', width: '8%', height: '6%', borderRadius: '50%' }} 
                    />
                    <BodyPartButton 
                      id="rightKnee" 
                      name="Right Knee" 
                      style={{ left: '58.5%', top: '82%', width: '8%', height: '6%', borderRadius: '50%' }} 
                    />
                  </g>

                  {/* Calves */}
                  <g>
                    <path d="M70 352 Q75 350 80 355 L78 385 Q75 390 72 385 L70 355 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <path d="M120 355 Q125 350 130 352 L128 385 Q125 390 122 385 L120 355 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftCalf" 
                      name="Left Calf" 
                      style={{ left: '35%', top: '88%', width: '5%', height: '10%', borderRadius: '8px' }} 
                    />
                    <BodyPartButton 
                      id="rightCalf" 
                      name="Right Calf" 
                      style={{ left: '60%', top: '88%', width: '5%', height: '10%', borderRadius: '8px' }} 
                    />
                  </g>

                  {/* Feet */}
                  <g>
                    <ellipse cx="75" cy="395" rx="12" ry="8" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <ellipse cx="125" cy="395" rx="12" ry="8" fill="url(#skinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                    <BodyPartButton 
                      id="leftFoot" 
                      name="Left Foot" 
                      style={{ left: '31.5%', top: '96%', width: '12%', height: '4%', borderRadius: '50%' }} 
                    />
                    <BodyPartButton 
                      id="rightFoot" 
                      name="Right Foot" 
                      style={{ left: '56.5%', top: '96%', width: '12%', height: '4%', borderRadius: '50%' }} 
                    />
                  </g>
                </svg>
              )}

              {/* Back View */}
              {currentView === "back" && (
                <svg width="200" height="400" viewBox="0 0 200 400" className="border rounded-lg bg-white shadow">
                  <defs>
                    <linearGradient id="backSkinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fdf2f8" />
                      <stop offset="50%" stopColor="#fce7f3" />
                      <stop offset="100%" stopColor="#fbcfe8" />
                    </linearGradient>
                  </defs>

                  {/* Head back */}
                  <ellipse cx="100" cy="35" rx="25" ry="30" fill="url(#backSkinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                  <BodyPartButton 
                    id="headBack" 
                    name="Head (Back)" 
                    style={{ left: '37.5%', top: '1%', width: '25%', height: '18%', borderRadius: '50%' }} 
                  />

                  {/* Neck back */}
                  <rect x="85" y="65" width="30" height="25" rx="8" fill="url(#backSkinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                  <BodyPartButton 
                    id="neckBack" 
                    name="Neck (Back)" 
                    style={{ left: '42.5%', top: '16%', width: '15%', height: '6%', borderRadius: '8px' }} 
                  />

                  {/* Upper back */}
                  <path d="M70 90 Q100 85 130 90 L125 160 Q100 165 75 160 Z" fill="url(#muscleTone)" stroke="#d1d5db" strokeWidth="1"/>
                  <BodyPartButton 
                    id="upperBack" 
                    name="Upper Back" 
                    style={{ left: '35%', top: '22%', width: '30%', height: '18%', borderRadius: '8px' }} 
                  />

                  {/* Spine visualization */}
                  <line x1="100" y1="70" x2="100" y2="250" stroke="#6b7280" strokeWidth="2" opacity="0.3"/>
                  <circle cx="100" cy="80" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="100" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="120" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="140" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="160" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="180" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="200" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="220" r="2" fill="#6b7280" opacity="0.5"/>
                  <circle cx="100" cy="240" r="2" fill="#6b7280" opacity="0.5"/>

                  {/* Lower back */}
                  <path d="M75 160 Q100 155 125 160 L120 220 Q100 225 80 220 Z" fill="url(#backSkinGradient)" stroke="#d1d5db" strokeWidth="1"/>
                  <BodyPartButton 
                    id="lowerBackDetailed" 
                    name="Lower Back" 
                    style={{ left: '37.5%', top: '40%', width: '25%', height: '15%', borderRadius: '8px' }} 
                  />

                  {/* Similar structure for rest of back view... */}
                </svg>
              )}

              {/* Side View */}
              {currentView === "side" && (
                <svg width="150" height="400" viewBox="0 0 150 400" className="border rounded-lg bg-white shadow">
                  {/* Side view anatomy... */}
                  <text x="75" y="200" textAnchor="middle" className="text-gray-500 text-sm">Side View</text>
                  <text x="75" y="220" textAnchor="middle" className="text-gray-400 text-xs">Coming Soon</text>
                </svg>
              )}
            </div>
          </div>

          {/* Selected Parts Panel */}
          {selectedParts.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Selected Body Parts</h4>
              <div className="space-y-3">
                {selectedParts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between">
                    <span className="text-sm">{part.name}</span>
                    {showIntensity && onIntensityChange && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Pain Level:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => onIntensityChange(part.id, level)}
                              className={`w-6 h-6 rounded-full border-2 ${
                                (part.intensity || 0) >= level
                                  ? 'bg-red-500 border-red-500'
                                  : 'bg-gray-200 border-gray-300'
                              } hover:scale-110 transition-transform`}
                              title={`Pain level ${level}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pain Intensity Legend */}
          {showIntensity && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Pain Intensity Scale</h5>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
                  <span>Mild (1-2)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-orange-400 border rounded"></div>
                  <span>Moderate (3-4)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-red-600 border rounded"></div>
                  <span>Severe (5)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}