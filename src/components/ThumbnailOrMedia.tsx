import React, { Suspense, lazy } from 'react';
import { Image } from '@heroui/react';
import { EntryInterface } from '../interfaces';

const LazyVideoPlayer = lazy(() => import('./VideoPlayer'));

interface ThumbnailOrMediaProps {
  entry?: EntryInterface;
  forceMedia?: boolean;
}

const ThumbnailOrMedia: React.FC<ThumbnailOrMediaProps> = ({ entry, forceMedia = false }) => {
  const item = entry;
  if (!item) {
    return null;
  }

  const showThumbnail = !forceMedia && item.thumbnail;
  const showMedia = item.media_content_url &&
    (forceMedia || !item.thumbnail);

  return (
    <div className="w-full h-full">
      {showThumbnail && (
        <Image
          className="w-full h-full object-cover rounded-lg"
          src={item.thumbnail}
          alt={item.title}
          width="100%"
          height="100%"
          loading="lazy"
        />
      )}

      {showMedia && (
        <>
          {item.media_content_type?.startsWith('image/') && (
            <Image
              className="w-full h-full object-cover rounded-lg"
              src={item.media_content_url}
              alt={item.title}
              width="100%"
              height="100%"
              loading="lazy"
            />
          )}

          {item.media_content_type?.startsWith('video/') && (
            <>
              <Suspense fallback={<div>Loading video...</div>}>
                <LazyVideoPlayer url={item.media_content_url!} />
              </Suspense>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ThumbnailOrMedia;

