import React, { useState } from "react";
// NOTE: Adjust these import paths based on your project structure
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

// Placeholder imports for assets (Replace with your paths)
import maleFront from "../../assets/images/male_front.png";
import maleSide from "../../assets/images/male_side.png";
import maleBack from "../../assets/images/male_back.png";
import femaleFront from "../../assets/images/female_front.png";
import femaleSide from "../../assets/images/female_side.png";
import femaleBack from "../../assets/images/female_back.png";

// Placeholder imports for annotation JSONs (For Selection Mode)
import maleFrontAnnotations from "../../assets/annotations/male-front_annotations.json";
import maleSideAnnotations from "../../assets/annotations/male-side_annotations.json";
import maleBackAnnotations from "../../assets/annotations/male-back_annotations.json";
import femaleFrontAnnotations from "../../assets/annotations/female-front_annotations.json";
import femaleSideAnnotations from "../../assets/annotations/female-side_annotations.json";
import femaleBackAnnotations from "../../assets/annotations/female-back_annotations.json";

// --- Interfaces ---
interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BodyPart {
  id: string;
  name: string;
  intensity?: number;
  view?: "front" | "side" | "back";
}

interface UnifiedBodyModelProps {
  title: string;
  selectedParts: BodyPart[];
  onPartSelect: (part: BodyPart) => void;
  onIntensityChange?: (partId: string, intensity: number) => void;
  showIntensity?: boolean;
  gender: "male" | "female";
  className?: string;

  // --- Props for Annotation Mode ---
  mode: "selection" | "annotation";
  modelRef: React.RefObject<HTMLDivElement>;
  tempRect: Annotation | null;
  newAnnotations: { [key: string]: Annotation };
  onBodyModelMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onBodyModelMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onViewChange?: (view: "front" | "side" | "back") => void;
}
// ----------------------------------------

export function UnifiedBodyModel({
  title,
  selectedParts,
  onPartSelect,
  onIntensityChange,
  showIntensity = true,
  gender,
  className = "",
  mode,
  modelRef,
  tempRect,
  newAnnotations,
  onBodyModelMouseDown,
  onBodyModelMouseMove,
  onViewChange,
}: UnifiedBodyModelProps) {
  const [currentView, setCurrentView] = useState<"front" | "side" | "back">(
    "front"
  );
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Data Maps (using placeholder imports)
  const models = {
    male: { front: maleFront, side: maleSide, back: maleBack },
    female: { front: femaleFront, side: femaleSide, back: femaleBack },
  };
  const annotations = {
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

  const handleViewChange = (view: "front" | "side" | "back") => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return "transparent";
    switch (intensity) {
      case 1:
        return "rgba(34, 197, 94, 0.3)";
      case 2:
        return "rgba(251, 191, 36, 0.4)";
      case 3:
        return "rgba(249, 115, 22, 0.5)";
      case 4:
        return "rgba(239, 68, 68, 0.6)";
      case 5:
        return "rgba(127, 29, 29, 0.7)";
      default:
        return "transparent";
    }
  };

  const handlePartClick = (partName: string) => {
    if (mode === "annotation") return;

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
        <Badge
          variant={mode === "selection" ? "default" : "destructive"}
          className="mx-auto"
        >
          {mode === "selection"
            ? "Pain Selection Mode"
            : "Annotation Drawing Mode"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Buttons */}
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
              onClick={() => handleViewChange(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)} View
            </Button>
          ))}
        </div>

        {/* Body Model and SVG Overlay */}
        <div className="flex justify-center">
          <div
            ref={modelRef}
            data-view={currentView}
            className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl border-2 border-white max-w-lg"
            onMouseDown={onBodyModelMouseDown}
            onMouseMove={onBodyModelMouseMove}
            // FIX: Removed: style={{ cursor: mode === "annotation" ? "crosshair" : "default" }}
          >
            <img
              src={models[gender][currentView]}
              alt={`3D ${gender} model - ${currentView} view`}
              className="w-full"
              // Ensure image fills the container for correct coordinate mapping
              style={{
                height: "100%",
                width: "100%",
                objectFit: "fill",
              }}
            />
            <svg
              className="absolute top-0 left-0 w-full h-full"
              // CRITICAL: Expand viewBox height and shift origin up
              viewBox="0 -125 450 1400"
            >
              {mode === "selection" ? (
                // --- SELECTION MODE RENDERING ---
                Object.entries(annotations[gender][currentView]).map(
                  ([name, { x, y, width, height }]: [string, any]) => {
                    const partId = `${name.replace(
                      /\s+/g,
                      "-"
                    )}_${currentView}`;
                    const isSelected = selectedParts.some(
                      (p) => p.id === partId
                    );
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
                        className="cursor-pointer transition-all duration-200"
                        fill={
                          isSelected
                            ? getIntensityColor(intensity)
                            : hoveredPart === name
                            ? "rgba(59, 130, 246, 0.15)"
                            : "transparent"
                        }
                        stroke={isSelected ? "#3b82f6" : "transparent"}
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredPart(name)}
                        onMouseLeave={() => setHoveredPart(null)}
                        onClick={() => handlePartClick(name)}
                      />
                    );
                  }
                )
              ) : (
                // --- ANNOTATION MODE RENDERING ---
                <>
                  {/* 1. Render all saved new annotations (Purple boxes) */}
                  {Object.entries(newAnnotations).map(
                    ([name, { x, y, width, height }]: [string, Annotation]) => (
                      <rect
                        key={name}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill="rgba(147, 51, 234, 0.4)"
                        stroke="#9333ea"
                        strokeWidth="2"
                      >
                        <title>{name}</title>
                      </rect>
                    )
                  )}

                  {/* 2. Render the temporary rectangle being drawn (Green dashed box) */}
                  {tempRect && (
                    <rect
                      x={tempRect.x}
                      y={tempRect.y}
                      width={tempRect.width}
                      height={tempRect.height}
                      fill="rgba(0, 255, 0, 0.3)"
                      stroke="#00cc00"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Intensity scale is only shown in Selection mode */}
        {mode === "selection" &&
          showIntensity &&
          selectedParts.some((p) => p.view === currentView) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              {/* ... Intensity scale code omitted ... */}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
