'use client';

import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: Array<string>;
  imageClassName?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
  imageClassName = 'object-cover',
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (results: CloudinaryUploadWidgetResults | undefined) => {
    if (
      !results ||
      typeof results === 'string' ||
      typeof results?.info === 'string'
    ) {
      return;
    }
    onChange(results?.info?.secure_url as string);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <CldUploadWidget onUpload={onUpload} uploadPreset="t2kowizg">
        {({ open }: { open: () => void }) => {
          const onClick = () => open();

          return (
            <button
              type="button"
              disabled={disabled}
              onClick={onClick}
              className="w-full h-36 flex items-center justify-center gap-2 py-2 px-4 border bg-background rounded"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload an Image
            </button>
          );
        }}
      </CldUploadWidget>
      {value?.length > 0 && (
        <div className="my-4 flex items-center gap-4">
          {value.map((url, i) => (
            <div
              key={url + i}
              className="relative w-[100px] h-[100px] rounded-md overflow-hidden"
            >
              <div className="z-10 absolute top-0 right-0">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <Image
                fill
                className={imageClassName}
                alt="Image"
                src={url}
                priority
                sizes="100px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
