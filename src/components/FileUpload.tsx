import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  value: string | undefined;
  onChange: (url?: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Upload failed");
        }

        const data = await response.json();
        onChange(data.url);
        toast.success("Avatar uploaded successfully!");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload avatar. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  if (value) {
    return (
      <div className="relative h-40 w-40">
        <img src={value} alt="Avatar Preview" className="h-full w-full rounded-full object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-0 right-0 rounded-full"
          onClick={() => onChange(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`relative flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed
       border-gray-300 bg-gray-50 text-center transition-colors hover:bg-gray-100 dark:border-gray-600
       dark:bg-gray-800 dark:hover:bg-gray-700 ${isDragActive ? "border-blue-500" : ""}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <p>Uploading...</p>
      ) : (
        <>
          <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isDragActive ? "Drop the file here..." : "Drag & drop or click to upload"}
          </p>
        </>
      )}
    </div>
  );
};

export default FileUpload;
