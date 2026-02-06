import { useState } from "react";
import { Upload, Video, X, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useToast } from "../../hooks/use-toast";

interface VideoUploadProps {
  onVideoUpload: (videoFile: File) => void;
  title: string;
  description?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export function VideoUpload({
  onVideoUpload,
  title,
  description,
  className,
  accept = "video/*",
  maxSize = 100, // 100MB default
}: VideoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please select a video file smaller than ${maxSize}MB.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus("uploading");

    // Simulate upload process (replace with actual upload logic)
    setTimeout(() => {
      onVideoUpload(file);
      setUploadStatus("success");
      toast({
        title: "Video Uploaded",
        description: "Your video has been uploaded successfully.",
      });
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
  };

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
      } ${className}`}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}

          {uploadStatus === "success" && selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Video uploaded successfully!
                </span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {selectedFile.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : uploadStatus === "uploading" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium">Uploading video...</span>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Drop your video here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports MP4, MOV, AVI up to {maxSize}MB
                </p>
              </div>

              <input
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
                id={`video-upload-${title.replace(/\s+/g, "-").toLowerCase()}`}
              />
              <label
                htmlFor={`video-upload-${title
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
                className="inline-block mt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Video
                </Button>
              </label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
