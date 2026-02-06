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

// Import Spurling's test video
// @ts-ignore: Treat imported media as any (no type declarations for mp4)
const spurlingsTestVideo =
  "https://spine-care-assets-2025.s3.ap-south-1.amazonaws.com/attached_assets/Spurlings test.mp4";

interface SpurlingsTestProps {
  values: {
    spurlingTest: string;
  };
  onChange: (field: string, value: any) => void;
  className?: string;
}

export function SpurlingsTest({
  values,
  onChange,
  className,
}: SpurlingsTestProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Modified Spurling's Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-800 mb-2">
              Test Instructions
            </h4>
            <p className="text-sm text-indigo-700">
              The Spurling's test evaluates cervical nerve root compression. The
              patient extends and laterally flexes their neck while looking up.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Video Demonstration */}
            <VideoDemonstration
              title="Spurling's Test Demonstration"
              description="Proper technique for cervical nerve root compression testing"
              videoSrc={spurlingsTestVideo}
            />
          </div>

          {/* Test Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-3">Test Results</h5>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Spurling's Test Result
              </span>
              <Select
                value={values.spurlingTest || ""}
                onValueChange={(value) => onChange("spurlingTest", value)}
              >
                <SelectTrigger className="medical-input">
                  <SelectValue placeholder="Select test result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">
                    Negative (no symptoms)
                  </SelectItem>
                  <SelectItem value="right_side_painful">
                    Positive - right side painful
                  </SelectItem>
                  <SelectItem value="left_side_painful">
                    Positive - left side painful
                  </SelectItem>
                  <SelectItem value="both_sides_painful">
                    Positive - both sides painful
                  </SelectItem>
                  <SelectItem value="inconclusive">
                    Inconclusive/unable to perform
                  </SelectItem>
                </SelectContent>
              </Select>
            </label>

            {values.spurlingTest &&
              values.spurlingTest !== "negative" &&
              values.spurlingTest !== "inconclusive" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Positive Test:</strong> Indicates possible cervical
                    nerve root compression. Further evaluation may be needed.
                  </p>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
