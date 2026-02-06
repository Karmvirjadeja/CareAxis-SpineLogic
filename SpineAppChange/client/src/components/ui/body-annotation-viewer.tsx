import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

// Import model images
// @ts-ignore: Allow importing image assets without specific type declarations
import maleFront from "../../assets/images/male_front.png";
// @ts-ignore: Allow importing image assets without specific type declarations
import maleSide from "../../assets/images/male_side.png";
// @ts-ignore: Allow importing image assets without specific type declarations
import maleBack from "../../assets/images/male_back.png";
// @ts-ignore: Allow importing image assets without specific type declarations
import femaleFront from "../../assets/images/female_front.png";
// @ts-ignore: Allow importing image assets without specific type declarations
import femaleSide from "../../assets/images/female_side.png";
// @ts-ignore: Allow importing image assets without specific type declarations
import femaleBack from "../../assets/images/female_back.png";

// Import annotation files. The `with { type: "json" }` syntax is used for JSON module imports.
import maleFrontAnnotations from "../../assets/annotations/male-front_annotations.json";
import maleSideAnnotations from "../../assets/annotations/male-side_annotations.json";
import maleBackAnnotations from "../../assets/annotations/male-back_annotations.json";
import femaleFrontAnnotations from "../../assets/annotations/female-front_annotations.json";
import femaleSideAnnotations from "../../assets/annotations/female-side_annotations.json";
import femaleBackAnnotations from "../../assets/annotations/female-back_annotations.json";

interface BodyPart {
  id: string;
  name: string;
  intensity?: number;
  view?: "front" | "side" | "back";
}

interface BodyAnnotationViewerProps {
  title: string;
  selectedParts: BodyPart[];
  onPartSelect: (part: BodyPart) => void;
  onIntensityChange?: (partId: string, intensity: number) => void;
  showIntensity?: boolean;
  gender: "male" | "female";
  className?: string;
  isReadOnly?: boolean;
}

export function BodyAnnotationViewer({
  title,
  selectedParts = [],
  onPartSelect,
  onIntensityChange,
  showIntensity = true,
  gender,
  className = "",
  isReadOnly = false,
}: BodyAnnotationViewerProps) {
  const [currentView, setCurrentView] = useState<"front" | "side" | "back">(
    "front"
  );
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const models = {
    male: { front: maleFront, side: maleSide, back: maleBack },
    female: { front: femaleFront, side: femaleSide, back: femaleBack },
  };

  const annotations: any = {
    male: {
      front: maleFrontAnnotations,
      side: maleSideAnnotations,
      back: maleBackAnnotations,
    },
    female: {
      front: femaleFrontAnnotations,
      side: femaleSideAnnotations,
      back: femaleBackAnnotations,
    },
  };

  const getIntensityColor = (intensity?: number, opacity = 0.4) => {
    if (!intensity) return "transparent";
    switch (intensity) {
      case 1:
        return `rgba(52, 211, 153, ${opacity})`; // Emerald 400
      case 2:
        return `rgba(163, 230, 53, ${opacity})`; // Lime 400
      case 3:
        return `rgba(250, 204, 21, ${opacity})`; // Yellow 400
      case 4:
        return `rgba(251, 146, 60, ${opacity})`; // Orange 400
      case 5:
        return `rgba(239, 68, 68, ${opacity})`; // Red 500
      default:
        return `rgba(59, 130, 246, ${opacity})`;
    }
  };

  const handlePartClick = (partName: string) => {
    if (isReadOnly) return;
    const partId = `${partName.replace(/\s+/g, "-")}_${currentView}`;
    const isSelected = selectedParts.some((p) => p.id === partId);

    onPartSelect({
      id: partId,
      name: partName,
      intensity: isSelected ? 0 : 1,
      view: currentView,
    });
  };

  return (
    <Card
      className={cn(
        "w-full shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50",
        className
      )}
    >
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
          {title}
        </CardTitle>
        <Badge variant="secondary" className="mx-auto">
          Interactive Anatomical Model
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-1 bg-white rounded-lg p-1 shadow-inner max-w-md mx-auto">
          {(["front", "side", "back"] as const).map((view) => (
            <Button
              key={view}
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 transition-all duration-300 text-sm font-medium",
                currentView === view
                  ? "bg-blue-500 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
              onClick={() => setCurrentView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)} View
            </Button>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl border-2 border-white max-w-lg">
            <img
              src={models[gender][currentView]}
              alt={`3D ${gender} model - ${currentView} view`}
              className="w-full h-auto select-none"
            />
            <svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 450 1150"
            >
              {/* Clickable regions */}
              {Object.entries(annotations[gender][currentView]).map(
                ([name, { x, y, width, height }]: [string, any]) => {
                  const partId = `${name.replace(/\s+/g, "-")}_${currentView}`;
                  const isSelected = selectedParts.some((p) => p.id === partId);
                  const intensity = selectedParts.find(
                    (p) => p.id === partId
                  )?.intensity;

                  return (
                    <rect
                      key={partId}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      className={cn(
                        "transition-all duration-200",
                        !isReadOnly && "cursor-pointer"
                      )}
                      fill={
                        isSelected
                          ? getIntensityColor(intensity)
                          : hoveredPart === name && !isReadOnly
                          ? "rgba(59, 130, 246, 0.2)"
                          : "transparent"
                      }
                      stroke={isSelected ? "#3b82f6" : "transparent"}
                      strokeWidth="2"
                      onMouseEnter={() => !isReadOnly && setHoveredPart(name)}
                      onMouseLeave={() => !isReadOnly && setHoveredPart(null)}
                      onClick={() => handlePartClick(name)}
                    />
                  );
                }
              )}
              {/* Markers for selected parts */}
              {selectedParts
                .filter((part) => part.view === currentView)
                .map((part) => {
                  const annotationData =
                    annotations[gender][currentView][part.name];
                  if (!annotationData) return null;

                  const { x, y, width, height } = annotationData;
                  const centerX = x + width / 2;
                  const centerY = y + height / 2;

                  return (
                    <g
                      key={`marker-${part.id}`}
                      className="pointer-events-none"
                    >
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r="12"
                        fill={getIntensityColor(part.intensity, 0.9)}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={centerX}
                        y={centerY}
                        dy=".3em"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="white"
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth="0.5"
                      >
                        {part.intensity}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        </div>

        {showIntensity &&
          !isReadOnly &&
          selectedParts.some((p) => p.view === currentView) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-4 text-center">
                Pain Intensity Scale -{" "}
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)}{" "}
                View
              </h4>
              <div className="space-y-3">
                {selectedParts
                  .filter((part) => part.view === currentView)
                  .map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                    >
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {part.name}
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((intensity) => (
                          <Button
                            key={intensity}
                            type="button"
                            variant={
                              part.intensity === intensity
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className={cn(
                              "w-8 h-8 p-0 text-xs font-bold transition-all duration-200",
                              part.intensity === intensity
                                ? "bg-blue-500 hover:bg-blue-600 shadow-md transform scale-110"
                                : "hover:bg-blue-50 hover:border-blue-300"
                            )}
                            onClick={() =>
                              onIntensityChange?.(part.id, intensity)
                            }
                          >
                            {intensity}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
