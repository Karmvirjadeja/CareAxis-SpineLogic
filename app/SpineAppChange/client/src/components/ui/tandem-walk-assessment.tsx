import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { VideoDemonstration } from "../../components/ui/video-demonstration";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Import tandem walk video
const tandemWalkVideo =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/Final_TademWalk.mp4";

interface TandemWalkAssessmentProps {
  values: {
    canWalkInLine: string;
  };
  onChange: (field: string, value: any) => void;
  className?: string;
}

export function TandemWalkAssessment({
  values,
  onChange,
  className,
}: TandemWalkAssessmentProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tandem Walk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">
              Assessment Instructions
            </h4>
            <p className="text-sm text-purple-700">
              The tandem walk test evaluates balance and coordination. Watch the
              demonstration and have the patient attempt to walk heel-to-toe in
              a straight line.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Video Demonstration */}
            <VideoDemonstration
              title="Tandem Walk Demonstration"
              description="Standard technique for heel-to-toe walking assessment"
              videoSrc={tandemWalkVideo}
            />
          </div>

          {/* Assessment Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-3">
              Assessment Results
            </h5>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Can walk in a straight line (tandem walk)?
              </span>
              <Select
                value={values.canWalkInLine || ""}
                onValueChange={(value) => onChange("canWalkInLine", value)}
              >
                <SelectTrigger className="medical-input">
                  <SelectValue placeholder="Select ability level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_easily">
                    Yes, easily without support
                  </SelectItem>
                  <SelectItem value="yes_difficulty">
                    Yes, with some difficulty
                  </SelectItem>
                  <SelectItem value="needs_support">
                    Needs support/assistance
                  </SelectItem>
                  <SelectItem value="cannot">Cannot perform</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
