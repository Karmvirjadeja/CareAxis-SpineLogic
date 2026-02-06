import { useState } from "react";
import { cn } from "../../lib/utils";
import { MedicalCheckbox } from "./medical-checkbox";

interface AnatomicalRangeOfMotionProps {
  spineMovements: string[];
  neckMovements: string[];
  spineMovementPain: boolean;
  neckMovementPain: boolean;
  onSpineMovementChange: (movements: string[]) => void;
  onNeckMovementChange: (movements: string[]) => void;
  onSpineMovementPainChange: (hasPain: boolean) => void;
  onNeckMovementPainChange: (hasPain: boolean) => void;
  className?: string;
}

const SPINE_MOVEMENTS = [
  "Bending forward",
  "Bending backwards", 
  "Bending on the side",
  "Left twisting",
  "Right twisting"
];

const NECK_MOVEMENTS = [
  "Extension",
  "Flexion",
  "Right lateral flexion",
  "Left lateral flexion", 
  "Right rotation",
  "Left rotation"
];

export function AnatomicalRangeOfMotion({ 
  spineMovements, 
  neckMovements, 
  spineMovementPain,
  neckMovementPain,
  onSpineMovementChange, 
  onNeckMovementChange,
  onSpineMovementPainChange,
  onNeckMovementPainChange,
  className 
}: AnatomicalRangeOfMotionProps) {
  const [currentView, setCurrentView] = useState<"spine" | "neck">("spine");

  const toggleSpineMovement = (movement: string) => {
    if (spineMovements.includes(movement)) {
      onSpineMovementChange(spineMovements.filter(m => m !== movement));
    } else {
      onSpineMovementChange([...spineMovements, movement]);
    }
  };

  const toggleNeckMovement = (movement: string) => {
    if (neckMovements.includes(movement)) {
      onNeckMovementChange(neckMovements.filter(m => m !== movement));
    } else {
      onNeckMovementChange([...neckMovements, movement]);
    }
  };

  const SpineRangeOfMotionModel = () => (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Forward Flexion */}
        <div className="text-center">
          <div className="relative w-20 h-28 bg-white rounded-lg flex items-center justify-center mb-2 border-2 border-blue-300 shadow-lg mx-auto">
            <svg width="70" height="110" viewBox="0 0 70 110">
              <defs>
                <linearGradient id="spineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              {/* Body bending forward - realistic curve */}
              <circle cx="35" cy="15" r="8" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="30" y="23" width="10" height="15" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              {/* Curved spine showing forward flexion */}
              <path d="M35 38 Q42 50 50 65 Q55 80 60 95" stroke="#3B82F6" strokeWidth="4" fill="none"/>
              {/* Torso outline following spine curve */}
              <path d="M25 40 Q35 35 45 40 Q52 55 58 70 Q60 85 58 95 Q50 100 40 95 Q30 85 25 70 Q20 55 25 40 Z" 
                    fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" opacity="0.7"/>
              {/* Legs */}
              <rect x="30" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
              <rect x="40" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-blue-600">Forward Flexion</span>
          <p className="text-xs text-gray-500 mt-1">Bending forward</p>
        </div>

        {/* Extension */}
        <div className="text-center">
          <div className="relative w-20 h-28 bg-white rounded-lg flex items-center justify-center mb-2 border-2 border-green-300 shadow-lg mx-auto">
            <svg width="70" height="110" viewBox="0 0 70 110">
              {/* Body bending backward */}
              <circle cx="35" cy="15" r="8" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="30" y="23" width="10" height="15" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              {/* Curved spine showing extension */}
              <path d="M35 38 Q28 50 20 65 Q15 80 10 95" stroke="#10B981" strokeWidth="4" fill="none"/>
              {/* Torso outline following spine curve */}
              <path d="M45 40 Q35 35 25 40 Q18 55 12 70 Q10 85 12 95 Q20 100 30 95 Q40 85 45 70 Q50 55 45 40 Z" 
                    fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" opacity="0.7"/>
              {/* Legs */}
              <rect x="25" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
              <rect x="35" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-green-600">Extension</span>
          <p className="text-xs text-gray-500 mt-1">Bending backward</p>
        </div>

        {/* Lateral Flexion */}
        <div className="text-center">
          <div className="relative w-20 h-28 bg-white rounded-lg flex items-center justify-center mb-2 border-2 border-orange-300 shadow-lg mx-auto">
            <svg width="70" height="110" viewBox="0 0 70 110">
              {/* Body bending sideways */}
              <circle cx="35" cy="15" r="8" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="30" y="23" width="10" height="15" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              {/* Curved spine showing lateral flexion */}
              <path d="M35 38 L35 55 Q45 70 55 85 L58 95" stroke="#F59E0B" strokeWidth="4" fill="none"/>
              {/* Torso outline following lateral curve */}
              <path d="M25 40 Q35 35 45 40 L50 70 Q55 85 50 95 Q40 100 30 95 L25 70 Q20 55 25 40 Z" 
                    fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" opacity="0.7"/>
              {/* Legs */}
              <rect x="30" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
              <rect x="40" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-orange-600">Lateral Flexion</span>
          <p className="text-xs text-gray-500 mt-1">Side bending</p>
        </div>

        {/* Left Rotation */}
        <div className="text-center">
          <div className="relative w-20 h-28 bg-white rounded-lg flex items-center justify-center mb-2 border-2 border-purple-300 shadow-lg mx-auto">
            <svg width="70" height="110" viewBox="0 0 70 110">
              {/* Body rotating left */}
              <circle cx="35" cy="15" r="8" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              <ellipse cx="35" cy="30" rx="8" ry="12" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15 35 30)"/>
              <path d="M35 42 L35 95" stroke="#8B5CF6" strokeWidth="4" fill="none"/>
              {/* Rotation indicator */}
              <circle cx="35" cy="60" r="20" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.6" />
              <path d="M50 50 Q55 45 60 50" stroke="#8B5CF6" strokeWidth="2" fill="none" />
              <path d="M58 48 L61 45 M58 48 L55 45" stroke="#8B5CF6" strokeWidth="2" fill="none" />
              {/* Legs */}
              <rect x="30" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
              <rect x="40" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-purple-600">Left Rotation</span>
          <p className="text-xs text-gray-500 mt-1">Turning left</p>
        </div>

        {/* Right Rotation */}
        <div className="text-center">
          <div className="relative w-20 h-28 bg-white rounded-lg flex items-center justify-center mb-2 border-2 border-indigo-300 shadow-lg mx-auto">
            <svg width="70" height="110" viewBox="0 0 70 110">
              {/* Body rotating right */}
              <circle cx="35" cy="15" r="8" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" />
              <ellipse cx="35" cy="30" rx="8" ry="12" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1" transform="rotate(15 35 30)"/>
              <path d="M35 42 L35 95" stroke="#6366F1" strokeWidth="4" fill="none"/>
              {/* Rotation indicator */}
              <circle cx="35" cy="60" r="20" stroke="#6366F1" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.6" />
              <path d="M20 50 Q15 45 10 50" stroke="#6366F1" strokeWidth="2" fill="none" />
              <path d="M12 48 L9 45 M12 48 L15 45" stroke="#6366F1" strokeWidth="2" fill="none" />
              {/* Legs */}
              <rect x="30" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
              <rect x="40" y="95" width="5" height="10" rx="2" fill="url(#spineGradient)" stroke="#cbd5e1" strokeWidth="1"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-indigo-600">Right Rotation</span>
          <p className="text-xs text-gray-500 mt-1">Turning right</p>
        </div>
      </div>
    </div>
  );

  const NeckRangeOfMotionModel = () => (
    <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Flexion/Extension */}
        <div className="text-center">
          <div className="relative w-24 h-32 bg-white rounded-lg flex items-center justify-center mb-3 border-2 border-green-300 shadow-lg mx-auto">
            <svg width="90" height="120" viewBox="0 0 90 120">
              <defs>
                <linearGradient id="neckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0fdf4" />
                  <stop offset="100%" stopColor="#dcfce7" />
                </linearGradient>
              </defs>
              {/* Head and neck anatomy */}
              <circle cx="45" cy="20" r="12" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              <rect x="40" y="32" width="10" height="18" rx="2" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              <rect x="35" y="50" width="20" height="20" rx="3" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              
              {/* Flexion movement (forward) */}
              <path d="M45 12 Q40 2 35 -5" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="3,3" opacity="0.8" />
              <path d="M37 -3 L34 0 M37 -3 L40 0" stroke="#10b981" strokeWidth="2" fill="none" />
              
              {/* Extension movement (backward) */}
              <path d="M45 12 Q50 2 55 -5" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="3,3" opacity="0.8" />
              <path d="M53 -3 L56 0 M53 -3 L50 0" stroke="#10b981" strokeWidth="2" fill="none" />
              
              <text x="45" y="90" textAnchor="middle" className="text-xs fill-green-600 font-medium">FLEX/EXT</text>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Flexion/Extension</span>
          <p className="text-xs text-gray-500 mt-1">Looking up and down</p>
        </div>

        {/* Lateral Flexion */}
        <div className="text-center">
          <div className="relative w-24 h-32 bg-white rounded-lg flex items-center justify-center mb-3 border-2 border-blue-300 shadow-lg mx-auto">
            <svg width="90" height="120" viewBox="0 0 90 120">
              {/* Head and neck anatomy */}
              <circle cx="45" cy="20" r="12" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              <rect x="40" y="32" width="10" height="18" rx="2" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              <rect x="35" y="50" width="20" height="20" rx="3" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              
              {/* Left lateral flexion */}
              <path d="M33 20 Q23 20 13 20" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="3,3" opacity="0.8" />
              <path d="M15 18 L12 15 M15 18 L12 21" stroke="#3b82f6" strokeWidth="2" fill="none" />
              
              {/* Right lateral flexion */}
              <path d="M57 20 Q67 20 77 20" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="3,3" opacity="0.8" />
              <path d="M75 18 L78 15 M75 18 L78 21" stroke="#3b82f6" strokeWidth="2" fill="none" />
              
              <text x="45" y="90" textAnchor="middle" className="text-xs fill-blue-600 font-medium">LATERAL</text>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Lateral Flexion</span>
          <p className="text-xs text-gray-500 mt-1">Ear to shoulder</p>
        </div>

        {/* Rotation */}
        <div className="text-center">
          <div className="relative w-24 h-32 bg-white rounded-lg flex items-center justify-center mb-3 border-2 border-purple-300 shadow-lg mx-auto">
            <svg width="90" height="120" viewBox="0 0 90 120">
              {/* Head and neck anatomy */}
              <circle cx="45" cy="20" r="12" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              <rect x="40" y="32" width="10" height="18" rx="2" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              <rect x="35" y="50" width="20" height="20" rx="3" fill="url(#neckGradient)" stroke="#4ade80" strokeWidth="1" />
              
              {/* Rotation circle */}
              <circle cx="45" cy="20" r="22" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeDasharray="4,4" opacity="0.6" />
              
              {/* Rotation arrows */}
              <path d="M62 10 Q67 5 72 10" stroke="#8b5cf6" strokeWidth="3" fill="none" />
              <path d="M70 8 L73 5 M70 8 L67 5" stroke="#8b5cf6" strokeWidth="2" fill="none" />
              
              <path d="M28 30 Q23 35 18 30" stroke="#8b5cf6" strokeWidth="3" fill="none" />
              <path d="M20 32 L17 35 M20 32 L23 35" stroke="#8b5cf6" strokeWidth="2" fill="none" />
              
              <text x="45" y="90" textAnchor="middle" className="text-xs fill-purple-600 font-medium">ROTATION</text>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Rotation</span>
          <p className="text-xs text-gray-500 mt-1">Turning left and right</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "spine", label: "Spine Range of Motion" },
          { key: "neck", label: "Neck Range of Motion" }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key as any)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              currentView === key
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Spine Range of Motion */}
      {currentView === "spine" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Spine Range of Motion Assessment</h4>
          
          <SpineRangeOfMotionModel />

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Unable to perform these spine movements:</h5>
              <div className="grid md:grid-cols-2 gap-3">
                {SPINE_MOVEMENTS.map((movement) => (
                  <MedicalCheckbox
                    key={movement}
                    id={`spine-${movement}`}
                    label={movement}
                    checked={spineMovements.includes(movement)}
                    onChange={() => toggleSpineMovement(movement)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <MedicalCheckbox
                id="spine-movement-pain"
                label="Experiences pain during spine movements"
                checked={spineMovementPain}
                onChange={onSpineMovementPainChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Neck Range of Motion */}
      {currentView === "neck" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Neck Range of Motion Assessment</h4>
          
          <NeckRangeOfMotionModel />

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Unable to perform these neck movements:</h5>
              <div className="grid md:grid-cols-2 gap-3">
                {NECK_MOVEMENTS.map((movement) => (
                  <MedicalCheckbox
                    key={movement}
                    id={`neck-${movement}`}
                    label={movement}
                    checked={neckMovements.includes(movement)}
                    onChange={() => toggleNeckMovement(movement)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <MedicalCheckbox
                id="neck-movement-pain"
                label="Experiences pain during neck movements"
                checked={neckMovementPain}
                onChange={onNeckMovementPainChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}