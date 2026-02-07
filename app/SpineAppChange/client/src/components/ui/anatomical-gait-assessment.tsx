import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

interface GaitAssessmentValues {
  canWalkOnRightToe: boolean;
  canWalkOnLeftToe: boolean;
  canWalkOnRightHeel: boolean;
  canWalkOnLeftHeel: boolean;
  canWalkInLine: string;
  gaitPattern: string;
}

interface AnatomicalGaitAssessmentProps {
  values: GaitAssessmentValues;
  onChange: (field: string, value: any) => void;
  className?: string;
}

export function AnatomicalGaitAssessment({ values, onChange, className }: AnatomicalGaitAssessmentProps) {
  const [currentAssessment, setCurrentAssessment] = useState<"heel-toe" | "tandem" | "pattern">("heel-toe");

  const HeelToeWalkingModel = () => (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toe Walking */}
        <div className="text-center">
          <h4 className="font-semibold mb-4 text-blue-700">Toe Walking Assessment</h4>
          <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-blue-200">
            <svg width="120" height="180" viewBox="0 0 120 180" className="mx-auto">
              <defs>
                <linearGradient id="legGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef3f2" />
                  <stop offset="100%" stopColor="#fde2e1" />
                </linearGradient>
                <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f9fafb" />
                  <stop offset="100%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>

              {/* Left Leg - Toe Walking */}
              <g transform="translate(15, 10)">
                {/* Thigh */}
                <path d="M15 0 Q20 -2 25 0 L23 40 Q20 42 17 40 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Knee */}
                <ellipse cx="20" cy="45" rx="6" ry="8" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Calf */}
                <path d="M17 53 Q20 51 23 53 L21 90 Q20 92 19 90 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Ankle */}
                <ellipse cx="20" cy="95" rx="4" ry="6" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Foot on toes */}
                <path d="M16 101 Q20 103 24 101 L26 108 Q22 115 18 108 Z" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Heel elevated */}
                <path d="M14 110 Q16 108 18 110" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="2,2"/>
                {/* Toe pressure point */}
                <circle cx="22" cy="105" r="2" fill="#ef4444"/>
                <text x="20" y="130" textAnchor="middle" className="text-xs fill-blue-600 font-medium">LEFT TOE</text>
              </g>

              {/* Right Leg - Toe Walking */}
              <g transform="translate(65, 10)">
                {/* Thigh */}
                <path d="M15 0 Q20 -2 25 0 L23 40 Q20 42 17 40 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Knee */}
                <ellipse cx="20" cy="45" rx="6" ry="8" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Calf */}
                <path d="M17 53 Q20 51 23 53 L21 90 Q20 92 19 90 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Ankle */}
                <ellipse cx="20" cy="95" rx="4" ry="6" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Foot on toes */}
                <path d="M16 101 Q20 103 24 101 L26 108 Q22 115 18 108 Z" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Heel elevated */}
                <path d="M14 110 Q16 108 18 110" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="2,2"/>
                {/* Toe pressure point */}
                <circle cx="22" cy="105" r="2" fill="#ef4444"/>
                <text x="20" y="130" textAnchor="middle" className="text-xs fill-blue-600 font-medium">RIGHT TOE</text>
              </g>

              {/* Weight distribution arrows */}
              <path d="M35 120 Q60 130 85 120" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowToe)"/>
              <defs>
                <marker id="arrowToe" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6"/>
                </marker>
              </defs>
              <text x="60" y="140" textAnchor="middle" className="text-xs fill-gray-600">Weight on toes</text>
            </svg>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Left Toe Walking</span>
              <div className="flex space-x-2">
                <Button
                  variant={values.canWalkOnLeftToe ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnLeftToe", true)}
                  className="text-xs"
                >
                  Can Do
                </Button>
                <Button
                  variant={!values.canWalkOnLeftToe ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnLeftToe", false)}
                  className="text-xs"
                >
                  Cannot Do
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Right Toe Walking</span>
              <div className="flex space-x-2">
                <Button
                  variant={values.canWalkOnRightToe ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnRightToe", true)}
                  className="text-xs"
                >
                  Can Do
                </Button>
                <Button
                  variant={!values.canWalkOnRightToe ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnRightToe", false)}
                  className="text-xs"
                >
                  Cannot Do
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Heel Walking */}
        <div className="text-center">
          <h4 className="font-semibold mb-4 text-green-700">Heel Walking Assessment</h4>
          <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-green-200">
            <svg width="120" height="180" viewBox="0 0 120 180" className="mx-auto">
              {/* Left Leg - Heel Walking */}
              <g transform="translate(15, 10)">
                {/* Thigh */}
                <path d="M15 0 Q20 -2 25 0 L23 40 Q20 42 17 40 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Knee */}
                <ellipse cx="20" cy="45" rx="6" ry="8" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Calf */}
                <path d="M17 53 Q20 51 23 53 L21 90 Q20 92 19 90 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Ankle flexed */}
                <ellipse cx="20" cy="95" rx="4" ry="6" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Foot dorsiflexed on heel */}
                <path d="M16 101 Q20 99 24 101 L24 105 Q20 108 16 105 Z" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Toes elevated */}
                <path d="M24 105 Q26 103 28 105" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="2,2"/>
                {/* Heel pressure point */}
                <circle cx="18" cy="105" r="2" fill="#10b981"/>
                <text x="20" y="130" textAnchor="middle" className="text-xs fill-green-600 font-medium">LEFT HEEL</text>
              </g>

              {/* Right Leg - Heel Walking */}
              <g transform="translate(65, 10)">
                {/* Thigh */}
                <path d="M15 0 Q20 -2 25 0 L23 40 Q20 42 17 40 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Knee */}
                <ellipse cx="20" cy="45" rx="6" ry="8" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Calf */}
                <path d="M17 53 Q20 51 23 53 L21 90 Q20 92 19 90 Z" fill="url(#muscleGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Ankle flexed */}
                <ellipse cx="20" cy="95" rx="4" ry="6" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Foot dorsiflexed on heel */}
                <path d="M16 101 Q20 99 24 101 L24 105 Q20 108 16 105 Z" fill="url(#legGradient)" stroke="#d1d5db" strokeWidth="1"/>
                {/* Toes elevated */}
                <path d="M24 105 Q26 103 28 105" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="2,2"/>
                {/* Heel pressure point */}
                <circle cx="18" cy="105" r="2" fill="#10b981"/>
                <text x="20" y="130" textAnchor="middle" className="text-xs fill-green-600 font-medium">RIGHT HEEL</text>
              </g>

              {/* Balance indication */}
              <line x1="35" y1="115" x2="85" y2="115" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3"/>
              <text x="60" y="140" textAnchor="middle" className="text-xs fill-gray-600">Weight on heels</text>
            </svg>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Left Heel Walking</span>
              <div className="flex space-x-2">
                <Button
                  variant={values.canWalkOnLeftHeel ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnLeftHeel", true)}
                  className="text-xs"
                >
                  Can Do
                </Button>
                <Button
                  variant={!values.canWalkOnLeftHeel ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnLeftHeel", false)}
                  className="text-xs"
                >
                  Cannot Do
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Right Heel Walking</span>
              <div className="flex space-x-2">
                <Button
                  variant={values.canWalkOnRightHeel ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnRightHeel", true)}
                  className="text-xs"
                >
                  Can Do
                </Button>
                <Button
                  variant={!values.canWalkOnRightHeel ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onChange("canWalkOnRightHeel", false)}
                  className="text-xs"
                >
                  Cannot Do
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TandemWalkingModel = () => (
    <div className="bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg p-6">
      <h4 className="font-semibold mb-4 text-purple-700 text-center">Tandem Walking (Heel-to-Toe) Assessment</h4>
      <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-purple-200">
        <svg width="300" height="200" viewBox="0 0 300 200" className="mx-auto">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf4ff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
          </defs>

          {/* Full body figure demonstrating tandem walk */}
          <g transform="translate(150, 20)">
            {/* Head */}
            <circle cx="0" cy="15" r="12" fill="url(#bodyGradient)" stroke="#9333ea" strokeWidth="1"/>
            
            {/* Torso */}
            <rect x="-8" y="27" width="16" height="35" rx="4" fill="url(#bodyGradient)" stroke="#9333ea" strokeWidth="1"/>
            
            {/* Arms extended for balance */}
            <path d="M-8 35 Q-25 30 -35 35" stroke="#9333ea" strokeWidth="3" fill="none"/>
            <path d="M8 35 Q25 30 35 35" stroke="#9333ea" strokeWidth="3" fill="none"/>
            <circle cx="-35" cy="35" r="3" fill="#9333ea"/>
            <circle cx="35" cy="35" r="3" fill="#9333ea"/>
            
            {/* Left leg positioned */}
            <path d="M-4 62 Q-6 80 -8 100" stroke="#9333ea" strokeWidth="4" fill="none"/>
            {/* Right leg in line */}
            <path d="M4 62 Q2 80 0 100" stroke="#9333ea" strokeWidth="4" fill="none"/>
            
            {/* Feet in perfect line */}
            <g transform="translate(-8, 100)">
              {/* Left foot */}
              <ellipse cx="0" cy="0" rx="8" ry="4" fill="url(#bodyGradient)" stroke="#9333ea" strokeWidth="1"/>
              <text x="0" y="15" textAnchor="middle" className="text-xs fill-purple-600 font-medium">L</text>
            </g>
            
            <g transform="translate(0, 100)">
              {/* Right foot directly in front */}
              <ellipse cx="0" cy="0" rx="8" ry="4" fill="url(#bodyGradient)" stroke="#9333ea" strokeWidth="1"/>
              <text x="0" y="15" textAnchor="middle" className="text-xs fill-purple-600 font-medium">R</text>
            </g>
            
            {/* Balance line */}
            <line x1="-8" y1="104" x2="8" y2="104" stroke="#9333ea" strokeWidth="2" strokeDasharray="2,2"/>
            
            {/* Step sequence arrows */}
            <path d="M-15 120 Q-5 130 5 120" stroke="#9333ea" strokeWidth="2" fill="none" markerEnd="url(#arrowTandem)"/>
            <defs>
              <marker id="arrowTandem" markerWidth="8" markerHeight="8" refX="7" refY="2" orient="auto">
                <path d="M0,0 L0,4 L7,2 z" fill="#9333ea"/>
              </marker>
            </defs>
          </g>

          {/* Instruction text */}
          <text x="150" y="170" textAnchor="middle" className="text-sm fill-purple-700 font-medium">
            Heel-to-Toe Walking in Straight Line
          </text>
          <text x="150" y="185" textAnchor="middle" className="text-xs fill-gray-600">
            Arms extended for balance, one foot directly in front of the other
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Can walk in straight line (heel-to-toe)</span>
          <div className="flex space-x-2">
            {["Yes", "No", "With difficulty"].map((option) => (
              <Button
                key={option}
                variant={values.canWalkInLine === option ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("canWalkInLine", option)}
                className="text-xs"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const GaitPatternModel = () => (
    <div className="bg-gradient-to-b from-orange-50 to-orange-100 rounded-lg p-6">
      <h4 className="font-semibold mb-4 text-orange-700 text-center">Gait Pattern Assessment</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Normal Gait */}
        <div className="bg-white rounded-lg p-4 shadow border-2 border-orange-200">
          <svg width="100" height="120" viewBox="0 0 100 120" className="mx-auto mb-2">
            <g transform="translate(50, 10)">
              <circle cx="0" cy="10" r="8" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <rect x="-6" y="18" width="12" height="25" rx="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <path d="M-3 43 Q-5 55 -7 70" stroke="#ea580c" strokeWidth="3" fill="none"/>
              <path d="M3 43 Q5 55 7 70" stroke="#ea580c" strokeWidth="3" fill="none"/>
              <ellipse cx="-7" cy="70" rx="6" ry="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <ellipse cx="7" cy="70" rx="6" ry="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
            </g>
            <text x="50" y="100" textAnchor="middle" className="text-xs fill-orange-600 font-medium">Normal</text>
          </svg>
          <Button
            variant={values.gaitPattern === "Normal" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("gaitPattern", "Normal")}
            className="w-full text-xs"
          >
            Normal Gait
          </Button>
        </div>

        {/* Antalgic Gait */}
        <div className="bg-white rounded-lg p-4 shadow border-2 border-orange-200">
          <svg width="100" height="120" viewBox="0 0 100 120" className="mx-auto mb-2">
            <g transform="translate(50, 10)">
              <circle cx="0" cy="10" r="8" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <rect x="-6" y="18" width="12" height="25" rx="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <path d="M-3 43 Q-8 55 -12 70" stroke="#ea580c" strokeWidth="3" fill="none"/>
              <path d="M3 43 Q2 55 1 70" stroke="#ea580c" strokeWidth="3" fill="none"/>
              <ellipse cx="-12" cy="70" rx="6" ry="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <ellipse cx="1" cy="70" rx="6" ry="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <circle cx="-12" cy="70" r="2" fill="#ef4444"/>
            </g>
            <text x="50" y="100" textAnchor="middle" className="text-xs fill-orange-600 font-medium">Antalgic</text>
          </svg>
          <Button
            variant={values.gaitPattern === "Antalgic" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("gaitPattern", "Antalgic")}
            className="w-full text-xs"
          >
            Antalgic (Pain)
          </Button>
        </div>

        {/* Trendelenburg Gait */}
        <div className="bg-white rounded-lg p-4 shadow border-2 border-orange-200">
          <svg width="100" height="120" viewBox="0 0 100 120" className="mx-auto mb-2">
            <g transform="translate(50, 10)">
              <circle cx="0" cy="10" r="8" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <rect x="-6" y="18" width="12" height="25" rx="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" transform="rotate(10 0 30)"/>
              <path d="M-3 43 Q-5 55 -7 70" stroke="#ea580c" strokeWidth="3" fill="none"/>
              <path d="M3 43 Q5 55 7 70" stroke="#ea580c" strokeWidth="3" fill="none"/>
              <ellipse cx="-7" cy="70" rx="6" ry="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
              <ellipse cx="7" cy="70" rx="6" ry="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1"/>
            </g>
            <text x="50" y="100" textAnchor="middle" className="text-xs fill-orange-600 font-medium">Trendelenburg</text>
          </svg>
          <Button
            variant={values.gaitPattern === "Trendelenburg" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("gaitPattern", "Trendelenburg")}
            className="w-full text-xs"
          >
            Trendelenburg
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Gait Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Assessment Type Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: "heel-toe", label: "Heel/Toe Walking" },
              { key: "tandem", label: "Tandem Walking" },
              { key: "pattern", label: "Gait Pattern" }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCurrentAssessment(key as any)}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  currentAssessment === key
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Assessment Display */}
          {currentAssessment === "heel-toe" && <HeelToeWalkingModel />}
          {currentAssessment === "tandem" && <TandemWalkingModel />}
          {currentAssessment === "pattern" && <GaitPatternModel />}
        </div>
      </CardContent>
    </Card>
  );
}