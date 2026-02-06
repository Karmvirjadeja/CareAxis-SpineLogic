import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
// NOTE: Adjust these import paths based on your project structure
import { UnifiedBodyModel } from "./UnifiedBodyModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Interfaces (must match UnifiedBodyModel)
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

// CRITICAL: Change this constant to match the new viewBox height
const SVG_WIDTH = 450;
const SVG_HEIGHT = 1400;

export function BodyMapSelector() {
  const [currentGender, setCurrentGender] = useState<"male" | "female">("male");
  const [currentView, setCurrentView] = useState<"front" | "side" | "back">(
    "front"
  );
  const [mode, setMode] = useState<"selection" | "annotation">("annotation");

  // Annotation State
  const [newAnnotations, setNewAnnotations] = useState<{
    [key: string]: { [key: string]: Annotation };
  }>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [tempRect, setTempRect] = useState<Annotation | null>(null);

  const modelRef = useRef<HTMLDivElement>(null);
  const selectedParts: BodyPart[] = [];

  const getCurrentKey = () => `${currentGender}_${currentView}`;

  // --- Mode and View Handlers ---
  const handleToggleMode = () => {
    setMode((prev) => (prev === "selection" ? "annotation" : "selection"));
    setIsDrawing(false);
    setTempRect(null);
  };

  const handleGenderChange = (gender: "male" | "female") => {
    setCurrentGender(gender);
    setTempRect(null);
    setIsDrawing(false);
  };

  const handleViewChange = (view: "front" | "side" | "back") => {
    setCurrentView(view);
    setTempRect(null);
    setIsDrawing(false);
  };

  // --- Core Drawing Handlers (Attached to document) ---

  // 1. Mouse Down: Starts the drawing/dragging process.
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Only proceed if in annotation mode and the primary button is pressed
      if (mode !== "annotation" || e.button !== 0 || !modelRef.current) return;

      const modelRect = modelRef.current.getBoundingClientRect();

      // Check if the click occurred *over* the model area to START the draw.
      // We still need the starting click to be somewhat meaningful.
      // If you truly want to start dragging from *anywhere*, you can remove this check.
      if (
        e.clientX < modelRect.left ||
        e.clientX > modelRect.right ||
        e.clientY < modelRect.top ||
        e.clientY > modelRect.bottom
      ) {
        // We'll keep the start point check strict for better UX, but allow dragging globally later.
        // If the goal is strictly *global* drag start: remove this 'if' block.
        // For drawing bounding boxes on a specific element, keeping the start strict is better.
        // **However, to meet the explicit request to drag from *outside*, we will modify the logic slightly:**

        // If we want to start drag on the document, we must recalculate coordinates later.
        // For a more controlled experience, let's allow `handleMouseDown` to be attached
        // to the global container, but only enable drawing if `isDrawing` is true.
        // Since we are moving the event handlers to `document`, we must only proceed if the click is on the model area.

        // Let's attach the MOUSE DOWN listener to the card wrapper that holds the model,
        // and MOUSE MOVE/UP to the document. This is a common pattern.
        // For this scenario, we must rely on the previous logic, but now attach to the document.

        // Let's simplify and assume the user's intent is to allow a drag that *extends* outside.
        // We'll attach handlers to document and make the initial click start within the card.

        return; // Prevents drag start if click is outside the model bounds.
      }

      setIsDrawing(true);

      // Calculate start point based on model's position
      const startX =
        ((e.clientX - modelRect.left) * SVG_WIDTH) / modelRect.width;
      const startY =
        ((e.clientY - modelRect.top) * SVG_HEIGHT) / modelRect.height;

      setStartPoint({ x: startX, y: startY });
      setTempRect({ x: startX, y: startY, width: 0, height: 0 });
    },
    [mode]
  );

  // 2. Mouse Move: Draws the rectangle while dragging.
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrawing || !startPoint || !modelRef.current) return;

      const modelRect = modelRef.current.getBoundingClientRect();

      // Calculate current position relative to the model's bounding box
      const currentX =
        ((e.clientX - modelRect.left) * SVG_WIDTH) / modelRect.width;
      const currentY =
        ((e.clientY - modelRect.top) * SVG_HEIGHT) / modelRect.height;

      // The key: Allow currentX/Y to go outside 0-450/0-1400 for the calculation,
      // but ensure the rectangle is visible on the SVG.

      const width = Math.abs(currentX - startPoint.x);
      const height = Math.abs(currentY - startPoint.y);
      const newX = Math.min(startPoint.x, currentX);
      const newY = Math.min(startPoint.y, currentY);

      setTempRect({ x: newX, y: newY, width, height });
    },
    [isDrawing, startPoint]
  );

  // 3. Mouse Up: Finalizes the drag and saves the annotation.
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !tempRect) return;

    setIsDrawing(false);
    const { x, y, width, height } = tempRect;

    if (width < 5 || height < 5) {
      setTempRect(null);
      return;
    }

    const partName = prompt("Enter the name for this body part:");

    if (!partName || partName.trim() === "") {
      setTempRect(null);
      return;
    }

    const key = getCurrentKey();
    const name = partName.trim();

    // Save the new annotation (rounded to integers for clean JSON)
    setNewAnnotations((prev) => {
      const currentViewAnnotations = prev[key] || {};

      if (currentViewAnnotations[name]) {
        alert(`An annotation named '${name}' already exists.`);
        setTempRect(null);
        return prev;
      }

      return {
        ...prev,
        [key]: {
          ...currentViewAnnotations,
          [name]: {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
          },
        },
      };
    });

    setTempRect(null);
    setStartPoint(null);
  }, [isDrawing, tempRect, getCurrentKey]);

  // --- Global Event Listener Setup ---
  useEffect(() => {
    if (mode === "annotation") {
      // Attach handlers to the global document for drag continuity
      document.addEventListener(
        "mousedown",
        handleMouseDown as (e: Event) => void
      );
      document.addEventListener(
        "mousemove",
        handleMouseMove as (e: Event) => void
      );
      document.addEventListener("mouseup", handleMouseUp as (e: Event) => void);
    }

    return () => {
      // Cleanup
      document.removeEventListener(
        "mousedown",
        handleMouseDown as (e: Event) => void
      );
      document.removeEventListener(
        "mousemove",
        handleMouseMove as (e: Event) => void
      );
      document.removeEventListener(
        "mouseup",
        handleMouseUp as (e: Event) => void
      );
    };
  }, [mode, handleMouseDown, handleMouseMove, handleMouseUp]);

  // --- JSON Download Function (No change) ---

  const handleDownloadAnnotationsJson = () => {
    const key = getCurrentKey();
    const currentViewAnnotations = newAnnotations[key];

    if (
      !currentViewAnnotations ||
      Object.keys(currentViewAnnotations).length === 0
    ) {
      alert("No new annotations to download for this view.");
      return;
    }

    const jsonContent = JSON.stringify(currentViewAnnotations, null, 2);

    // Browser download trigger logic
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${key.replace("_", "-")}_annotations.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Display Utilities (No change) ---
  const currentViewAnnotations = newAnnotations[getCurrentKey()] || {};

  const displayNewAnnotations = useMemo(() => {
    const names = Object.keys(currentViewAnnotations).sort();

    if (names.length === 0) {
      return "No annotations for this view. Draw a box on the model to begin.";
    }

    return names.map((name) => {
      const { x, y, width, height } = currentViewAnnotations[name];
      return (
        <li key={name} className="text-sm">
          <span className="font-semibold text-purple-700">{name}</span>
          <span className="text-gray-600">
            {" "}
            (x:{x}, y:{y}, w:{width}, h:{height})
          </span>
        </li>
      );
    });
  }, [currentViewAnnotations]);

  // --- Render ---

  return (
    <div
      className="p-8 max-w-5xl mx-auto space-y-8"
      // Global Cursor Fix: Crosshair over the entire wrapper area
      style={{ cursor: mode === "annotation" ? "crosshair" : "default" }}
    >
      <Card className="shadow-2xl border-2 border-indigo-100">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center text-indigo-800">
            3D Body Annotation Tool 📝
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Switch and Gender Selector */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleToggleMode}
              variant={mode === "annotation" ? "destructive" : "default"}
              className="px-6 py-2 text-lg"
            >
              Mode:{" "}
              {mode === "selection"
                ? "Pain Selection (Click)"
                : "Annotation (Draw)"}
            </Button>
            <Button
              onClick={() => handleGenderChange("male")}
              variant={currentGender === "male" ? "secondary" : "outline"}
              className="px-6 py-2 text-lg"
            >
              Male Model
            </Button>
            <Button
              onClick={() => handleGenderChange("female")}
              variant={currentGender === "female" ? "secondary" : "outline"}
              className="px-6 py-2 text-lg"
            >
              Female Model
            </Button>
          </div>

          <hr className="my-4 border-indigo-200" />

          {/* Unified Body Model Component */}
          <UnifiedBodyModel
            title={`Start Drawing on the ${currentGender.toUpperCase()} Model`}
            selectedParts={selectedParts}
            onPartSelect={() => {}}
            onIntensityChange={() => {}}
            showIntensity={false}
            gender={currentGender}
            className="md:flex-1"
            // --- Props for Annotation Mode ---
            mode={mode}
            modelRef={modelRef}
            tempRect={tempRect}
            newAnnotations={currentViewAnnotations}
            // Removed mouse handlers here; they are now global
            onViewChange={handleViewChange}
          />
        </CardContent>
      </Card>

      {/* Annotation Output Card */}
      {mode === "annotation" && (
        <Card className="shadow-lg border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800">
              New Annotations (Current View: {currentView.toUpperCase()})
            </CardTitle>
            <Button
              onClick={handleDownloadAnnotationsJson}
              disabled={Object.keys(currentViewAnnotations).length === 0}
              className="bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Download JSON 📦
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {displayNewAnnotations}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
