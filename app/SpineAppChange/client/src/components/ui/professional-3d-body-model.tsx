import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { User, Users } from "lucide-react";
import femaleModelFront from "../../assets/3D female Human Model_1754026636282.jpg";
import maleModelFront from "../../assets/3D male Human Model_1754026636282.jpg";

interface BodyPart {
  id: string;
  name: string;
  intensity?: number;
}

interface Professional3DBodyModelProps {
  title: string;
  selectedParts: BodyPart[];
  onPartSelect: (part: BodyPart) => void;
  onIntensityChange?: (partId: string, intensity: number) => void;
  showIntensity?: boolean;
  gender: "male" | "female";
  className?: string;
}

export function Professional3DBodyModel({
  title,
  selectedParts,
  onPartSelect,
  onIntensityChange,
  showIntensity = true,
  gender,
  className = ""
}: Professional3DBodyModelProps) {
  const [currentView, setCurrentView] = useState<"front" | "back" | "side">("front");
  const [currentGender, setCurrentGender] = useState<"male" | "female">(gender);

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return "rgba(59, 130, 246, 0.1)";
    switch (intensity) {
      case 1: return "rgba(254, 240, 138, 0.7)"; // yellow-200
      case 2: return "rgba(252, 211, 77, 0.8)"; // yellow-400
      case 3: return "rgba(245, 158, 11, 0.8)"; // yellow-500
      case 4: return "rgba(234, 88, 12, 0.9)"; // orange-600
      case 5: return "rgba(220, 38, 38, 0.9)"; // red-600
      default: return "rgba(59, 130, 246, 0.1)";
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

  // Professional 3D Female Model using actual reference image
  const FemaleModelFront = () => (
    <div className="relative w-[400px] h-[600px] mx-auto border rounded-lg bg-white shadow-lg overflow-hidden">
      {/* Photorealistic 3D Model Background */}
      <img 
        src={femaleModelFront} 
        alt="Professional 3D Female Human Model"
        className="absolute inset-0 w-full h-full object-contain object-center"
        style={{ 
          filter: 'contrast(1.1) brightness(1.05)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Interactive Overlay Areas */}
      <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 400 600">
        {/* Head Area - Aligned with actual female model positioning */}
        <ellipse cx="200" cy="60" rx="35" ry="45" 
                 fill={getIntensityColor(getPartIntensity("head"))} 
                 stroke={isPartSelected("head") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("head", "Head")}
                 opacity="0.3"/>
        
        {/* Neck Area - Better positioned */}
        <rect x="185" y="105" width="30" height="35" rx="15" 
              fill={getIntensityColor(getPartIntensity("neck"))} 
              stroke={isPartSelected("neck") ? "#3b82f6" : "transparent"} 
              strokeWidth="3" 
              style={{ cursor: "pointer" }}
              onClick={() => handlePartClick("neck", "Neck")}
              opacity="0.3"/>
        
        {/* Left Shoulder - Corrected position */}
        <ellipse cx="155" cy="160" rx="30" ry="20" 
                 fill={getIntensityColor(getPartIntensity("leftShoulder"))} 
                 stroke={isPartSelected("leftShoulder") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftShoulder", "Left Shoulder")}
                 opacity="0.3"/>
        
        {/* Right Shoulder - Corrected position */}
        <ellipse cx="245" cy="160" rx="30" ry="20" 
                 fill={getIntensityColor(getPartIntensity("rightShoulder"))} 
                 stroke={isPartSelected("rightShoulder") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightShoulder", "Right Shoulder")}
                 opacity="0.3"/>
        
        {/* Left Arm - Better alignment */}
        <rect x="120" y="180" width="25" height="120" rx="12" 
              fill={getIntensityColor(getPartIntensity("leftArm"))} 
              stroke={isPartSelected("leftArm") ? "#3b82f6" : "transparent"} 
              strokeWidth="3" 
              style={{ cursor: "pointer" }}
              onClick={() => handlePartClick("leftArm", "Left Arm")}
              opacity="0.3"/>
        
        {/* Right Arm - Better alignment */}
        <rect x="255" y="180" width="25" height="120" rx="12" 
              fill={getIntensityColor(getPartIntensity("rightArm"))} 
              stroke={isPartSelected("rightArm") ? "#3b82f6" : "transparent"} 
              strokeWidth="3" 
              style={{ cursor: "pointer" }}
              onClick={() => handlePartClick("rightArm", "Right Arm")}
              opacity="0.3"/>
        
        {/* Chest/Breast Area - More accurate positioning */}
        <ellipse cx="200" cy="190" rx="40" ry="25" 
                 fill={getIntensityColor(getPartIntensity("chest"))} 
                 stroke={isPartSelected("chest") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("chest", "Chest")}
                 opacity="0.3"/>
        
        {/* Abdomen - Properly aligned */}
        <ellipse cx="200" cy="250" rx="35" ry="35" 
                 fill={getIntensityColor(getPartIntensity("abdomen"))} 
                 stroke={isPartSelected("abdomen") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("abdomen", "Abdomen")}
                 opacity="0.3"/>
        
        {/* Lower Back/Hip Area - Correctly positioned */}
        <ellipse cx="200" cy="320" rx="40" ry="25" 
                 fill={getIntensityColor(getPartIntensity("lowerBack"))} 
                 stroke={isPartSelected("lowerBack") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("lowerBack", "Lower Back")}
                 opacity="0.3"/>
        
        {/* Left Hip - Accurate position */}
        <ellipse cx="175" cy="350" rx="20" ry="30" 
                 fill={getIntensityColor(getPartIntensity("leftHip"))} 
                 stroke={isPartSelected("leftHip") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftHip", "Left Hip")}
                 opacity="0.3"/>
        
        {/* Right Hip - Accurate position */}
        <ellipse cx="225" cy="350" rx="20" ry="30" 
                 fill={getIntensityColor(getPartIntensity("rightHip"))} 
                 stroke={isPartSelected("rightHip") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightHip", "Right Hip")}
                 opacity="0.3"/>
        
        {/* Left Thigh - Corrected alignment */}
        <ellipse cx="175" cy="420" rx="18" ry="45" 
                 fill={getIntensityColor(getPartIntensity("leftThigh"))} 
                 stroke={isPartSelected("leftThigh") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftThigh", "Left Thigh")}
                 opacity="0.3"/>
        
        {/* Right Thigh - Corrected alignment */}
        <ellipse cx="225" cy="420" rx="18" ry="45" 
                 fill={getIntensityColor(getPartIntensity("rightThigh"))} 
                 stroke={isPartSelected("rightThigh") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightThigh", "Right Thigh")}
                 opacity="0.3"/>
        
        {/* Left Knee - Proper position */}
        <circle cx="175" cy="480" r="12" 
                fill={getIntensityColor(getPartIntensity("leftKnee"))} 
                stroke={isPartSelected("leftKnee") ? "#3b82f6" : "transparent"} 
                strokeWidth="3" 
                style={{ cursor: "pointer" }}
                onClick={() => handlePartClick("leftKnee", "Left Knee")}
                opacity="0.3"/>
        
        {/* Right Knee - Proper position */}
        <circle cx="225" cy="480" r="12" 
                fill={getIntensityColor(getPartIntensity("rightKnee"))} 
                stroke={isPartSelected("rightKnee") ? "#3b82f6" : "transparent"} 
                strokeWidth="3" 
                style={{ cursor: "pointer" }}
                onClick={() => handlePartClick("rightKnee", "Right Knee")}
                opacity="0.3"/>
        
        {/* Left Calf - Aligned with model */}
        <ellipse cx="175" cy="520" rx="10" ry="20" 
                 fill={getIntensityColor(getPartIntensity("leftCalf"))} 
                 stroke={isPartSelected("leftCalf") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftCalf", "Left Calf")}
                 opacity="0.3"/>
        
        {/* Right Calf - Aligned with model */}
        <ellipse cx="225" cy="520" rx="10" ry="20" 
                 fill={getIntensityColor(getPartIntensity("rightCalf"))} 
                 stroke={isPartSelected("rightCalf") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightCalf", "Right Calf")}
                 opacity="0.3"/>
        
        {/* Left Foot - Correct position */}
        <ellipse cx="175" cy="560" rx="15" ry="8" 
                 fill={getIntensityColor(getPartIntensity("leftFoot"))} 
                 stroke={isPartSelected("leftFoot") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftFoot", "Left Foot")}
                 opacity="0.3"/>
        
        {/* Right Foot - Correct position */}
        <ellipse cx="225" cy="560" rx="15" ry="8" 
                 fill={getIntensityColor(getPartIntensity("rightFoot"))} 
                 stroke={isPartSelected("rightFoot") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightFoot", "Right Foot")}
                 opacity="0.3"/>
      </svg>
      
      {/* Professional Medical Overlay */}
      <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1 text-xs font-semibold text-gray-700">
        3D Medical Model - Female
      </div>
    </div>
  );

  // Professional 3D Male Model using actual reference image
  const MaleModelFront = () => (
    <div className="relative w-[400px] h-[600px] mx-auto border rounded-lg bg-white shadow-lg overflow-hidden">
      {/* Photorealistic 3D Model Background */}
      <img 
        src={maleModelFront} 
        alt="Professional 3D Male Human Model"
        className="absolute inset-0 w-full h-full object-contain object-center"
        style={{ 
          filter: 'contrast(1.1) brightness(1.05)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Interactive Overlay Areas */}
      <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 400 600">
        {/* Head Area - Aligned with actual male model positioning */}
        <ellipse cx="200" cy="50" rx="40" ry="50" 
                 fill={getIntensityColor(getPartIntensity("head"))} 
                 stroke={isPartSelected("head") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("head", "Head")}
                 opacity="0.3"/>
        
        {/* Neck Area - Male proportions */}
        <rect x="180" y="100" width="40" height="40" rx="18" 
              fill={getIntensityColor(getPartIntensity("neck"))} 
              stroke={isPartSelected("neck") ? "#3b82f6" : "transparent"} 
              strokeWidth="3" 
              style={{ cursor: "pointer" }}
              onClick={() => handlePartClick("neck", "Neck")}
              opacity="0.3"/>
        
        {/* Left Shoulder - Broader male shoulders */}
        <ellipse cx="140" cy="170" rx="35" ry="25" 
                 fill={getIntensityColor(getPartIntensity("leftShoulder"))} 
                 stroke={isPartSelected("leftShoulder") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftShoulder", "Left Shoulder")}
                 opacity="0.3"/>
        
        {/* Right Shoulder - Broader male shoulders */}
        <ellipse cx="260" cy="170" rx="35" ry="25" 
                 fill={getIntensityColor(getPartIntensity("rightShoulder"))} 
                 stroke={isPartSelected("rightShoulder") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightShoulder", "Right Shoulder")}
                 opacity="0.3"/>
        
        {/* Left Arm - Male muscular arms */}
        <rect x="95" y="195" width="30" height="130" rx="15" 
              fill={getIntensityColor(getPartIntensity("leftArm"))} 
              stroke={isPartSelected("leftArm") ? "#3b82f6" : "transparent"} 
              strokeWidth="3" 
              style={{ cursor: "pointer" }}
              onClick={() => handlePartClick("leftArm", "Left Arm")}
              opacity="0.3"/>
        
        {/* Right Arm - Male muscular arms */}
        <rect x="275" y="195" width="30" height="130" rx="15" 
              fill={getIntensityColor(getPartIntensity("rightArm"))} 
              stroke={isPartSelected("rightArm") ? "#3b82f6" : "transparent"} 
              strokeWidth="3" 
              style={{ cursor: "pointer" }}
              onClick={() => handlePartClick("rightArm", "Right Arm")}
              opacity="0.3"/>
        
        {/* Chest/Pectoral Area - Male chest definition */}
        <ellipse cx="200" cy="200" rx="50" ry="30" 
                 fill={getIntensityColor(getPartIntensity("chest"))} 
                 stroke={isPartSelected("chest") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("chest", "Chest")}
                 opacity="0.3"/>
        
        {/* Abdomen - Six-pack abs area */}
        <ellipse cx="200" cy="270" rx="40" ry="40" 
                 fill={getIntensityColor(getPartIntensity("abdomen"))} 
                 stroke={isPartSelected("abdomen") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("abdomen", "Abdomen")}
                 opacity="0.3"/>
        
        {/* Lower Back/Hip Area - Male proportions */}
        <ellipse cx="200" cy="340" rx="45" ry="30" 
                 fill={getIntensityColor(getPartIntensity("lowerBack"))} 
                 stroke={isPartSelected("lowerBack") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("lowerBack", "Lower Back")}
                 opacity="0.3"/>
        
        {/* Left Hip - Male hip structure */}
        <ellipse cx="170" cy="370" rx="25" ry="35" 
                 fill={getIntensityColor(getPartIntensity("leftHip"))} 
                 stroke={isPartSelected("leftHip") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftHip", "Left Hip")}
                 opacity="0.3"/>
        
        {/* Right Hip - Male hip structure */}
        <ellipse cx="230" cy="370" rx="25" ry="35" 
                 fill={getIntensityColor(getPartIntensity("rightHip"))} 
                 stroke={isPartSelected("rightHip") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightHip", "Right Hip")}
                 opacity="0.3"/>
        
        {/* Left Thigh - Male muscular thighs */}
        <ellipse cx="170" cy="440" rx="22" ry="50" 
                 fill={getIntensityColor(getPartIntensity("leftThigh"))} 
                 stroke={isPartSelected("leftThigh") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftThigh", "Left Thigh")}
                 opacity="0.3"/>
        
        {/* Right Thigh - Male muscular thighs */}
        <ellipse cx="230" cy="440" rx="22" ry="50" 
                 fill={getIntensityColor(getPartIntensity("rightThigh"))} 
                 stroke={isPartSelected("rightThigh") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightThigh", "Right Thigh")}
                 opacity="0.3"/>
        
        {/* Left Knee - Proper positioning */}
        <circle cx="170" cy="500" r="15" 
                fill={getIntensityColor(getPartIntensity("leftKnee"))} 
                stroke={isPartSelected("leftKnee") ? "#3b82f6" : "transparent"} 
                strokeWidth="3" 
                style={{ cursor: "pointer" }}
                onClick={() => handlePartClick("leftKnee", "Left Knee")}
                opacity="0.3"/>
        
        {/* Right Knee - Proper positioning */}
        <circle cx="230" cy="500" r="15" 
                fill={getIntensityColor(getPartIntensity("rightKnee"))} 
                stroke={isPartSelected("rightKnee") ? "#3b82f6" : "transparent"} 
                strokeWidth="3" 
                style={{ cursor: "pointer" }}
                onClick={() => handlePartClick("rightKnee", "Right Knee")}
                opacity="0.3"/>
        
        {/* Left Calf - Male calf muscles */}
        <ellipse cx="170" cy="535" rx="12" ry="22" 
                 fill={getIntensityColor(getPartIntensity("leftCalf"))} 
                 stroke={isPartSelected("leftCalf") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftCalf", "Left Calf")}
                 opacity="0.3"/>
        
        {/* Right Calf - Male calf muscles */}
        <ellipse cx="230" cy="535" rx="12" ry="22" 
                 fill={getIntensityColor(getPartIntensity("rightCalf"))} 
                 stroke={isPartSelected("rightCalf") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightCalf", "Right Calf")}
                 opacity="0.3"/>
        
        {/* Left Foot - Accurate positioning */}
        <ellipse cx="170" cy="570" rx="18" ry="10" 
                 fill={getIntensityColor(getPartIntensity("leftFoot"))} 
                 stroke={isPartSelected("leftFoot") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("leftFoot", "Left Foot")}
                 opacity="0.3"/>
        
        {/* Right Foot - Accurate positioning */}
        <ellipse cx="230" cy="570" rx="18" ry="10" 
                 fill={getIntensityColor(getPartIntensity("rightFoot"))} 
                 stroke={isPartSelected("rightFoot") ? "#3b82f6" : "transparent"} 
                 strokeWidth="3" 
                 style={{ cursor: "pointer" }}
                 onClick={() => handlePartClick("rightFoot", "Right Foot")}
                 opacity="0.3"/>
      </svg>
      
      {/* Professional Medical Overlay */}
      <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1 text-xs font-semibold text-gray-700">
        3D Medical Model - Male
      </div>
    </div>
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
                {view} View
              </Button>
            ))}
          </div>

          {/* Professional 3D Body Model Display */}
          <div className="flex justify-center">
            <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-4 shadow-inner">
              {currentView === "front" && (
                currentGender === "female" ? <FemaleModelFront /> : <MaleModelFront />
              )}

              {currentView === "back" && (
                <div className="relative w-[400px] h-[600px] mx-auto border rounded-lg bg-white shadow-lg overflow-hidden">
                  <img 
                    src={currentGender === "female" ? femaleModelFront : maleModelFront}
                    alt={`Professional 3D ${currentGender} Human Model - Back View`}
                    className="absolute inset-0 w-full h-full object-contain object-center"
                    style={{ 
                      filter: 'contrast(1.1) brightness(1.05)',
                      transform: 'scale(1.1) scaleX(-1)' // Mirror for back view
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1 text-xs font-semibold text-gray-700">
                    3D Medical Model - {currentGender === "female" ? "Female" : "Male"} (Back View)
                  </div>
                </div>
              )}

              {currentView === "side" && (
                <div className="relative w-[400px] h-[600px] mx-auto border rounded-lg bg-white shadow-lg overflow-hidden">
                  <img 
                    src={currentGender === "female" ? femaleModelFront : maleModelFront}
                    alt={`Professional 3D ${currentGender} Human Model - Side View`}
                    className="absolute inset-0 w-full h-full object-contain object-center"
                    style={{ 
                      filter: 'contrast(1.1) brightness(1.05) hue-rotate(10deg)',
                      transform: 'scale(1.1) rotate(5deg)' // Slight rotation for side view effect
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1 text-xs font-semibold text-gray-700">
                    3D Medical Model - {currentGender === "female" ? "Female" : "Male"} (Side View)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Parts Panel */}
          {selectedParts.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Selected Body Parts with Pain Levels</h4>
              <div className="space-y-3">
                {selectedParts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{part.name}</span>
                    {showIntensity && onIntensityChange && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Pain Level:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => onIntensityChange(part.id, level)}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                (part.intensity || 0) >= level
                                  ? level <= 2 ? 'bg-yellow-400 border-yellow-500'
                                    : level <= 3 ? 'bg-orange-500 border-orange-600'
                                    : 'bg-red-600 border-red-700'
                                  : 'bg-gray-200 border-gray-300'
                              } hover:scale-110`}
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

          {/* Professional Pain Intensity Legend */}
          {showIntensity && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border">
              <h5 className="font-semibold text-sm mb-3 text-gray-800">Professional Pain Assessment Scale</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded"></div>
                  <span className="font-medium">Mild (1-2)</span>
                  <span className="text-gray-600">Tolerable discomfort</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 border border-orange-600 rounded"></div>
                  <span className="font-medium">Moderate (3)</span>
                  <span className="text-gray-600">Noticeable pain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 border border-red-700 rounded"></div>
                  <span className="font-medium">Severe (4-5)</span>
                  <span className="text-gray-600">Intense pain</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}