import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
// @ts-ignore - allow image import without a global declaration file
const femaleModelPath =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/3D female Human Model_1754026636282.jpg";
const maleModelPath =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/3D male Human Model_1754026636282.jpg";

interface BodyPart {
  id: string;
  name: string;
  intensity?: number;
}

interface PhotorealisticBodyModelProps {
  title: string;
  selectedParts: BodyPart[];
  onPartSelect: (part: BodyPart) => void;
  onIntensityChange?: (partId: string, intensity: number) => void;
  showIntensity?: boolean;
  gender: "male" | "female";
  className?: string;
}

export function PhotorealisticBodyModel({
  title,
  selectedParts,
  onPartSelect,
  onIntensityChange,
  showIntensity = true,
  gender,
  className = "",
}: PhotorealisticBodyModelProps) {
  const [currentView, setCurrentView] = useState<0 | 1 | 2>(0); // 0=front, 1=side, 2=back
  const [showOverlay, setShowOverlay] = useState(true);

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return "rgba(59, 130, 246, 0.15)";
    switch (intensity) {
      case 1:
        return "rgba(34, 197, 94, 0.4)"; // Green - mild
      case 2:
        return "rgba(251, 191, 36, 0.5)"; // Yellow - mild-moderate
      case 3:
        return "rgba(249, 115, 22, 0.6)"; // Orange - moderate
      case 4:
        return "rgba(239, 68, 68, 0.7)"; // Red - severe
      case 5:
        return "rgba(127, 29, 29, 0.8)"; // Dark red - extreme
      default:
        return "rgba(59, 130, 246, 0.15)";
    }
  };

  const isPartSelected = (partId: string) => {
    return selectedParts.some((part) => part.id === partId);
  };

  const getPartIntensity = (partId: string) => {
    return selectedParts.find((part) => part.id === partId)?.intensity || 0;
  };

  const handlePartClick = (
    partId: string,
    partName: string,
    event?: React.MouseEvent
  ) => {
    // Prevent any form submission when clicking body parts
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      const nativeEvent = event.nativeEvent;
      if (
        nativeEvent &&
        typeof nativeEvent.stopImmediatePropagation === "function"
      ) {
        nativeEvent.stopImmediatePropagation();
      }
    }

    // Toggle selection: if part is already selected, deselect it
    const isCurrentlySelected = selectedParts.some(
      (part) => part.id === partId
    );

    if (isCurrentlySelected) {
      // Deselect the part by setting intensity to 0 (the parent handler recognizes this)
      onPartSelect({ id: partId, name: partName, intensity: 0 });
    } else {
      // Select the part normally (with default intensity 1)
      onPartSelect({ id: partId, name: partName, intensity: 1 });
    }
  };

  // Get the current model image path
  const getCurrentImagePath = () => {
    return gender === "female" ? femaleModelPath : maleModelPath;
  };

  // Define anatomically accurate body part shapes using SVG paths
  const getBodyPartShapes = () => {
    if (gender === "female") {
      // Anatomically accurate SVG paths for female model
      const shapes = [
        // Front view paths
        {
          head: "M 170 50 Q 200 30 230 50 Q 235 80 230 110 Q 200 130 170 110 Q 165 80 170 50 Z",
          neck: "M 185 140 Q 200 135 215 140 L 210 170 Q 200 175 190 170 Z",
          leftShoulder:
            "M 120 180 Q 140 175 160 185 Q 155 210 140 220 Q 125 215 115 200 Q 118 190 120 180 Z",
          rightShoulder:
            "M 240 185 Q 260 175 280 180 Q 285 190 282 200 Q 275 215 260 220 Q 245 210 240 185 Z",
          leftArm:
            "M 85 220 Q 95 215 105 225 L 110 350 Q 105 365 95 365 L 80 360 Q 75 350 80 225 Z",
          rightArm:
            "M 295 225 Q 305 215 315 220 L 320 350 Q 315 365 305 365 L 290 360 Q 285 350 295 225 Z",
          chest:
            "M 160 220 Q 180 215 200 220 Q 220 215 240 220 Q 245 240 240 260 Q 220 280 200 285 Q 180 280 160 260 Q 155 240 160 220 Z",
          abdomen:
            "M 170 285 Q 190 280 210 285 Q 230 285 230 310 Q 228 340 220 365 Q 200 375 180 365 Q 172 340 170 310 Z",
          lowerBack:
            "M 175 365 Q 195 360 215 365 Q 220 385 215 405 Q 195 415 175 405 Q 170 385 175 365 Z",
          leftHip:
            "M 140 405 Q 160 400 170 415 Q 168 445 160 470 Q 150 480 140 475 Q 135 450 140 405 Z",
          rightHip:
            "M 230 415 Q 240 400 260 405 Q 265 450 260 475 Q 250 480 240 470 Q 232 445 230 415 Z",
          leftThigh:
            "M 150 470 Q 165 465 175 475 Q 178 520 175 565 Q 170 575 160 575 Q 148 565 145 520 Q 148 475 150 470 Z",
          rightThigh:
            "M 225 475 Q 235 465 250 470 Q 255 475 252 520 Q 255 565 250 575 Q 240 575 230 565 Q 222 520 225 475 Z",
          leftKnee:
            "M 155 565 Q 170 560 175 570 Q 172 585 165 590 Q 155 590 150 585 Q 152 570 155 565 Z",
          rightKnee:
            "M 225 570 Q 230 560 245 565 Q 248 570 245 585 Q 240 590 230 590 Q 225 585 225 570 Z",
          leftCalf:
            "M 155 590 Q 170 585 175 595 Q 178 635 175 675 Q 170 685 160 685 Q 148 675 145 635 Q 148 595 155 590 Z",
          rightCalf:
            "M 225 595 Q 235 585 245 590 Q 248 595 245 635 Q 248 675 245 685 Q 235 685 225 675 Q 222 635 225 595 Z",
          leftFoot:
            "M 145 675 Q 160 670 175 680 Q 180 690 175 700 Q 160 705 145 700 Q 140 690 145 675 Z",
          rightFoot:
            "M 225 680 Q 240 670 255 675 Q 260 690 255 700 Q 240 705 225 700 Q 220 690 225 680 Z",
        },
        // Side view paths
        {
          head: "M 170 50 Q 200 30 230 50 Q 235 80 230 110 Q 200 130 170 110 Q 165 80 170 50 Z",
          neck: "M 185 140 Q 200 135 215 140 L 210 170 Q 200 175 190 170 Z",
          shoulder:
            "M 140 180 Q 180 175 220 180 Q 225 200 220 220 Q 180 225 140 220 Q 135 200 140 180 Z",
          arm: "M 120 220 Q 180 215 240 220 Q 245 240 240 260 Q 180 265 120 260 Q 115 240 120 220 Z",
          chest:
            "M 160 220 Q 180 215 200 220 Q 220 215 240 220 Q 245 240 240 260 Q 220 280 200 285 Q 180 280 160 260 Q 155 240 160 220 Z",
          abdomen:
            "M 170 285 Q 190 280 210 285 Q 230 285 230 310 Q 228 340 220 365 Q 200 375 180 365 Q 172 340 170 310 Z",
          lowerBack:
            "M 175 365 Q 195 360 215 365 Q 220 385 215 405 Q 195 415 175 405 Q 170 385 175 365 Z",
          hip: "M 160 405 Q 180 400 220 405 Q 225 425 220 455 Q 200 470 180 470 Q 160 455 155 425 Q 160 405 160 405 Z",
          thigh:
            "M 170 470 Q 190 465 210 470 Q 215 520 210 565 Q 190 575 170 565 Q 165 520 170 470 Z",
          knee: "M 175 565 Q 190 560 205 565 Q 208 580 205 590 Q 190 590 175 590 Q 172 580 175 565 Z",
          calf: "M 175 590 Q 190 585 205 590 Q 208 635 205 675 Q 190 685 175 675 Q 172 635 175 590 Z",
          foot: "M 170 675 Q 185 670 210 675 Q 215 690 210 700 Q 185 705 170 700 Q 165 690 170 675 Z",
        },
        // Back view paths
        {
          head: "M 170 50 Q 200 30 230 50 Q 235 80 230 110 Q 200 130 170 110 Q 165 80 170 50 Z",
          neck: "M 185 140 Q 200 135 215 140 L 210 170 Q 200 175 190 170 Z",
          leftShoulder:
            "M 240 185 Q 260 175 280 180 Q 285 190 282 200 Q 275 215 260 220 Q 245 210 240 185 Z",
          rightShoulder:
            "M 120 180 Q 140 175 160 185 Q 155 210 140 220 Q 125 215 115 200 Q 118 190 120 180 Z",
          leftArm:
            "M 295 225 Q 305 215 315 220 L 320 350 Q 315 365 305 365 L 290 360 Q 285 350 295 225 Z",
          rightArm:
            "M 85 220 Q 95 215 105 225 L 110 350 Q 105 365 95 365 L 80 360 Q 75 350 80 225 Z",
          upperBack:
            "M 160 220 Q 180 215 200 220 Q 220 215 240 220 Q 245 240 240 260 Q 220 280 200 285 Q 180 280 160 260 Q 155 240 160 220 Z",
          lowerBack:
            "M 170 285 Q 190 280 210 285 Q 230 285 230 310 Q 228 385 220 405 Q 200 415 180 405 Q 172 385 170 310 Z",
          leftHip:
            "M 230 415 Q 240 400 260 405 Q 265 450 260 475 Q 250 480 240 470 Q 232 445 230 415 Z",
          rightHip:
            "M 140 405 Q 160 400 170 415 Q 168 445 160 470 Q 150 480 140 475 Q 135 450 140 405 Z",
          leftThigh:
            "M 225 475 Q 235 465 250 470 Q 255 475 252 520 Q 255 565 250 575 Q 240 575 230 565 Q 222 520 225 475 Z",
          rightThigh:
            "M 150 470 Q 165 465 175 475 Q 178 520 175 565 Q 170 575 160 575 Q 148 565 145 520 Q 148 475 150 470 Z",
          leftKnee:
            "M 225 570 Q 230 560 245 565 Q 248 570 245 585 Q 240 590 230 590 Q 225 585 225 570 Z",
          rightKnee:
            "M 155 565 Q 170 560 175 570 Q 172 585 165 590 Q 155 590 150 585 Q 152 570 155 565 Z",
          leftCalf:
            "M 225 595 Q 235 585 245 590 Q 248 595 245 635 Q 248 675 245 685 Q 235 685 225 675 Q 222 635 225 595 Z",
          rightCalf:
            "M 155 590 Q 170 585 175 595 Q 178 635 175 675 Q 170 685 160 685 Q 148 675 145 635 Q 148 595 155 590 Z",
          leftFoot:
            "M 225 680 Q 240 670 255 675 Q 260 690 255 700 Q 240 705 225 700 Q 220 690 225 680 Z",
          rightFoot:
            "M 145 675 Q 160 670 175 680 Q 180 690 175 700 Q 160 705 145 700 Q 140 690 145 675 Z",
        },
      ];
      return shapes[currentView];
    } else {
      // Male model anatomically accurate paths - more muscular proportions
      const shapes = [
        // Front view paths
        {
          head: "M 160 40 Q 200 20 240 40 Q 250 75 240 110 Q 200 130 160 110 Q 150 75 160 40 Z",
          neck: "M 175 130 Q 200 125 225 130 L 220 170 Q 200 180 180 170 Z",
          leftShoulder:
            "M 100 170 Q 130 160 160 175 Q 155 205 135 225 Q 110 220 95 195 Q 98 180 100 170 Z",
          rightShoulder:
            "M 240 175 Q 270 160 300 170 Q 305 180 302 195 Q 290 220 265 225 Q 245 205 240 175 Z",
          leftArm:
            "M 60 210 Q 75 200 90 215 L 95 370 Q 90 385 75 385 L 55 380 Q 50 370 60 210 Z",
          rightArm:
            "M 310 215 Q 325 200 340 210 L 345 370 Q 340 385 325 385 L 305 380 Q 300 370 310 215 Z",
          chest:
            "M 140 210 Q 170 200 200 210 Q 230 200 260 210 Q 270 235 260 270 Q 230 290 200 295 Q 170 290 140 270 Q 130 235 140 210 Z",
          abdomen:
            "M 160 295 Q 180 290 200 295 Q 220 290 240 295 Q 245 320 240 380 Q 220 395 200 400 Q 180 395 160 380 Q 155 320 160 295 Z",
          lowerBack:
            "M 165 400 Q 185 395 215 400 Q 225 420 220 460 Q 200 470 185 470 Q 165 460 160 420 Q 165 400 165 400 Z",
          leftHip:
            "M 130 460 Q 150 455 165 470 Q 168 510 160 545 Q 150 555 135 550 Q 125 510 130 460 Z",
          rightHip:
            "M 235 470 Q 250 455 270 460 Q 275 510 265 550 Q 250 555 240 545 Q 232 510 235 470 Z",
          leftThigh:
            "M 140 545 Q 155 540 170 550 Q 175 600 170 645 Q 165 655 150 655 Q 135 645 130 600 Q 135 550 140 545 Z",
          rightThigh:
            "M 230 550 Q 245 540 260 545 Q 265 550 260 600 Q 265 645 260 655 Q 245 655 230 645 Q 225 600 230 550 Z",
          leftKnee:
            "M 145 645 Q 160 640 170 650 Q 167 670 155 675 Q 145 675 140 670 Q 142 650 145 645 Z",
          rightKnee:
            "M 230 650 Q 235 640 250 645 Q 253 650 250 670 Q 245 675 235 675 Q 230 670 230 650 Z",
          leftCalf:
            "M 145 675 Q 160 670 170 680 Q 175 720 170 760 Q 165 770 150 770 Q 135 760 130 720 Q 135 680 145 675 Z",
          rightCalf:
            "M 230 680 Q 245 670 255 675 Q 258 680 255 720 Q 258 760 255 770 Q 245 770 230 760 Q 225 720 230 680 Z",
          leftFoot:
            "M 130 760 Q 150 755 170 765 Q 175 780 170 790 Q 150 795 130 790 Q 125 780 130 760 Z",
          rightFoot:
            "M 230 765 Q 250 755 270 760 Q 275 780 270 790 Q 250 795 230 790 Q 225 780 230 765 Z",
        },
        // Side view paths
        {
          head: "M 160 40 Q 200 20 240 40 Q 250 75 240 110 Q 200 130 160 110 Q 150 75 160 40 Z",
          neck: "M 175 130 Q 200 125 225 130 L 220 170 Q 200 180 180 170 Z",
          shoulder:
            "M 140 170 Q 180 160 240 170 Q 250 190 240 230 Q 180 240 140 230 Q 130 190 140 170 Z",
          arm: "M 100 210 Q 180 200 260 210 Q 270 235 260 270 Q 180 280 100 270 Q 90 235 100 210 Z",
          chest:
            "M 140 210 Q 170 200 200 210 Q 230 200 260 210 Q 270 235 260 270 Q 230 290 200 295 Q 170 290 140 270 Q 130 235 140 210 Z",
          abdomen:
            "M 160 295 Q 180 290 200 295 Q 220 290 240 295 Q 245 320 240 380 Q 220 395 200 400 Q 180 395 160 380 Q 155 320 160 295 Z",
          lowerBack:
            "M 165 400 Q 185 395 215 400 Q 225 420 220 460 Q 200 470 185 470 Q 165 460 160 420 Q 165 400 165 400 Z",
          hip: "M 150 460 Q 180 455 230 460 Q 240 485 230 525 Q 200 545 180 545 Q 150 525 140 485 Q 150 460 150 460 Z",
          thigh:
            "M 160 545 Q 180 540 220 545 Q 230 600 220 645 Q 180 655 160 645 Q 150 600 160 545 Z",
          knee: "M 170 645 Q 185 640 215 645 Q 220 660 215 675 Q 185 675 170 675 Q 165 660 170 645 Z",
          calf: "M 165 675 Q 180 670 215 675 Q 220 720 215 760 Q 180 770 165 760 Q 160 720 165 675 Z",
          foot: "M 160 760 Q 180 755 220 760 Q 230 780 220 790 Q 180 795 160 790 Q 150 780 160 760 Z",
        },
        // Back view paths
        {
          head: "M 160 40 Q 200 20 240 40 Q 250 75 240 110 Q 200 130 160 110 Q 150 75 160 40 Z",
          neck: "M 175 130 Q 200 125 225 130 L 220 170 Q 200 180 180 170 Z",
          leftShoulder:
            "M 240 175 Q 270 160 300 170 Q 305 180 302 195 Q 290 220 265 225 Q 245 205 240 175 Z",
          rightShoulder:
            "M 100 170 Q 130 160 160 175 Q 155 205 135 225 Q 110 220 95 195 Q 98 180 100 170 Z",
          leftArm:
            "M 310 215 Q 325 200 340 210 L 345 370 Q 340 385 325 385 L 305 380 Q 300 370 310 215 Z",
          rightArm:
            "M 60 210 Q 75 200 90 215 L 95 370 Q 90 385 75 385 L 55 380 Q 50 370 60 210 Z",
          upperBack:
            "M 140 210 Q 170 200 200 210 Q 230 200 260 210 Q 270 235 260 270 Q 230 290 200 295 Q 170 290 140 270 Q 130 235 140 210 Z",
          lowerBack:
            "M 160 295 Q 180 290 200 295 Q 220 290 240 295 Q 245 320 240 460 Q 220 470 200 470 Q 180 470 160 460 Q 155 320 160 295 Z",
          leftHip:
            "M 235 470 Q 250 455 270 460 Q 275 510 265 550 Q 250 555 240 545 Q 232 510 235 470 Z",
          rightHip:
            "M 130 460 Q 150 455 165 470 Q 168 510 160 545 Q 150 555 135 550 Q 125 510 130 460 Z",
          leftThigh:
            "M 230 550 Q 245 540 260 545 Q 265 550 260 600 Q 265 645 260 655 Q 245 655 230 645 Q 225 600 230 550 Z",
          rightThigh:
            "M 140 545 Q 155 540 170 550 Q 175 600 170 645 Q 165 655 150 655 Q 135 645 130 600 Q 135 550 140 545 Z",
          leftKnee:
            "M 230 650 Q 235 640 250 645 Q 253 650 250 670 Q 245 675 235 675 Q 230 670 230 650 Z",
          rightKnee:
            "M 145 645 Q 160 640 170 650 Q 167 670 155 675 Q 145 675 140 670 Q 142 650 145 645 Z",
          leftCalf:
            "M 230 680 Q 245 670 255 675 Q 258 680 255 720 Q 258 760 255 770 Q 245 770 230 760 Q 225 720 230 680 Z",
          rightCalf:
            "M 145 675 Q 160 670 170 680 Q 175 720 170 760 Q 165 770 150 770 Q 135 760 130 720 Q 135 680 145 675 Z",
          leftFoot:
            "M 230 765 Q 250 755 270 760 Q 275 780 270 790 Q 250 795 230 790 Q 225 780 230 765 Z",
          rightFoot:
            "M 130 760 Q 150 755 170 765 Q 175 780 170 790 Q 150 795 130 790 Q 125 780 130 760 Z",
        },
      ];
      return shapes[currentView];
    }
  };

  const bodyShapes = getBodyPartShapes();
  const viewLabels = ["Front View", "Side View", "Back View"];

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Photorealistic 3D Model
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const nativeEvent = e.nativeEvent;
                if (
                  nativeEvent &&
                  typeof nativeEvent.stopImmediatePropagation === "function"
                ) {
                  nativeEvent.stopImmediatePropagation();
                }
                setShowOverlay(!showOverlay);
              }}
            >
              {showOverlay ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* View Selector */}
          <div className="flex justify-center space-x-2">
            {viewLabels.map((label, index) => (
              <Button
                key={index}
                type="button"
                variant={currentView === index ? "default" : "outline"}
                size="sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const nativeEvent = e.nativeEvent;
                  if (
                    nativeEvent &&
                    typeof nativeEvent.stopImmediatePropagation === "function"
                  ) {
                    nativeEvent.stopImmediatePropagation();
                  }
                  setCurrentView(index as 0 | 1 | 2);
                }}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* 3D Model Container */}
          <div className="relative w-full max-w-md mx-auto bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg border">
            {/* Photorealistic 3D Model Image */}
            <div className="relative aspect-[2/3] w-full">
              <img
                src={getCurrentImagePath()}
                alt={`Professional 3D ${gender} human anatomy model - ${viewLabels[currentView]}`}
                className="w-full h-full object-contain object-center"
                style={{
                  filter: "contrast(1.1) brightness(1.05) saturate(1.1)",
                  clipPath:
                    currentView === 0
                      ? "polygon(0% 0%, 33.33% 0%, 33.33% 100%, 0% 100%)" // Front view
                      : currentView === 1
                      ? "polygon(33.33% 0%, 66.66% 0%, 66.66% 100%, 33.33% 100%)" // Side view
                      : "polygon(66.66% 0%, 100% 0%, 100% 100%, 66.66% 100%)", // Back view
                  transform: "scale(1.2)",
                }}
              />

              {/* Interactive Overlay with Anatomically Accurate Shapes */}
              {showOverlay && (
                <svg
                  width="100%"
                  height="100%"
                  className="absolute inset-0 cursor-pointer"
                  viewBox="0 0 400 800"
                >
                  <defs>
                    <filter
                      id="bodyPartGlow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {Object.entries(bodyShapes).map(([partId, pathData]) => (
                    <path
                      key={partId}
                      d={pathData}
                      fill={getIntensityColor(getPartIntensity(partId))}
                      stroke={
                        isPartSelected(partId)
                          ? "#3b82f6"
                          : "rgba(59, 130, 246, 0.3)"
                      }
                      strokeWidth={isPartSelected(partId) ? "3" : "1"}
                      filter={
                        isPartSelected(partId) ? "url(#bodyPartGlow)" : "none"
                      }
                      className="transition-all duration-300 hover:stroke-blue-400 hover:stroke-2 hover:drop-shadow-lg cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as SVGPathElement;
                        target.style.filter = "url(#bodyPartGlow)";
                        target.style.strokeWidth = "2";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as SVGPathElement;
                        if (!isPartSelected(partId)) {
                          target.style.filter = "none";
                          target.style.strokeWidth = "1";
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePartClick(
                          partId,
                          partId.replace(/([A-Z])/g, " $1").trim(),
                          e
                        );
                      }}
                    />
                  ))}

                  {/* Visual feedback for selected parts */}
                  {selectedParts.map((part) => (
                    <text
                      key={`label-${part.id}`}
                      x="200"
                      y="30"
                      textAnchor="middle"
                      className="fill-blue-600 text-sm font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      {part.name}{" "}
                      {part.intensity ? `(${part.intensity}/5)` : ""}
                    </text>
                  ))}
                </svg>
              )}
            </div>

            {/* Model Info */}
            <div className="p-3 bg-white border-t">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {gender === "female" ? "Female" : "Male"} Anatomical Model -{" "}
                  {viewLabels[currentView]}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click on body parts to select pain locations
                </p>
              </div>
            </div>
          </div>

          {/* Intensity Selector for Selected Part */}
          {showIntensity && selectedParts.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Pain Intensity Scale</h4>
              <div className="space-y-2">
                {selectedParts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">{part.name}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((intensity) => (
                        <Button
                          key={intensity}
                          type="button"
                          variant={
                            part.intensity === intensity ? "default" : "outline"
                          }
                          size="sm"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const nativeEvent = e.nativeEvent;
                            if (
                              nativeEvent &&
                              typeof nativeEvent.stopImmediatePropagation ===
                                "function"
                            ) {
                              nativeEvent.stopImmediatePropagation();
                            }
                            onIntensityChange?.(part.id, intensity);
                          }}
                          className="w-8 h-8 text-xs"
                        >
                          {intensity}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                1 = Mild | 2 = Moderate | 3 = Severe | 4 = Extreme | 5 =
                Unbearable
              </div>
            </div>
          )}

          {/* Selected Parts Summary */}
          {selectedParts.length > 0 && (
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="font-medium text-sm mb-2">
                Selected Pain Locations
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedParts.map((part) => (
                  <Badge
                    key={part.id}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: getIntensityColor(part.intensity),
                    }}
                  >
                    {part.name} {part.intensity && `(${part.intensity}/5)`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PhotorealisticBodyModel;
