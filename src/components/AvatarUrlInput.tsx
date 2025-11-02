import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";

interface AvatarUrlInputProps {
  value: string | undefined;
  onChange: (url?: string) => void;
}

const AvatarUrlInput: React.FC<AvatarUrlInputProps> = ({ value, onChange }) => {
  const [imageError, setImageError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateImageUrl = (url: string): boolean => {
    const imageExtensions = /\.(jpg|jpeg|png)$/i;
    return imageExtensions.test(url);
  };

  const handleUrlChange = (newUrl: string) => {
    setImageError(false);
    if (newUrl.trim() === "") {
      onChange(undefined);
      return;
    }

    if (!validateImageUrl(newUrl)) {
      setImageError(true);
      onChange(newUrl); // Still update the value but show error
      return;
    }

    setIsValidating(true);
    onChange(newUrl);

    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImageError(false);
      setIsValidating(false);
    };
    img.onerror = () => {
      setImageError(true);
      setIsValidating(false);
    };
    img.src = newUrl;
  };

  const clearAvatar = () => {
    onChange(undefined);
    setImageError(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Input
          type="url"
          placeholder="https://example.com/avatar.jpg"
          value={value || ""}
          onChange={(e) => handleUrlChange(e.target.value)}
          className={imageError ? "border-red-500" : ""}
        />
        {value && (
          <Button type="button" variant="outline" size="icon" onClick={clearAvatar} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0">
            {isValidating ? (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                <ImageIcon className="h-4 w-4 text-gray-400 animate-pulse" />
              </div>
            ) : imageError ? (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-red-50 border-2 border-red-200">
                <X className="h-4 w-4 text-red-400" />
              </div>
            ) : (
              <img
                src={value}
                alt="Avatar preview"
                className="h-full w-full rounded-full object-cover border"
                style={{ width: "64px", height: "64px" }}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {imageError ? (
              <p className="text-sm text-red-500">Invalid image URL or image failed to load</p>
            ) : (
              <p className="text-sm text-gray-500">Podgląd awatara</p>
            )}
          </div>
        </div>
      )}

      {imageError && <p className="text-sm text-red-500">Please enter a valid image URL (jpg, jpeg, or png)</p>}
    </div>
  );
};

export default AvatarUrlInput;
