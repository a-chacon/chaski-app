import React, { Suspense, lazy } from 'react';
import { Image } from '@heroui/react';
import { ArticleInterface } from '../interfaces';

const LazyVideoPlayer = lazy(() => import('./VideoPlayer'));

interface ThumbnailOrMediaProps {
  article: ArticleInterface;
  forceMedia?: boolean;
}

const ThumbnailOrMedia: React.FC<ThumbnailOrMediaProps> = ({ article, forceMedia = false }) => {
  const showThumbnail = !forceMedia && article.thumbnail;
  const showMedia = article.media_content_url &&
    (forceMedia || !article.thumbnail);

  return (
    <div className="w-full h-full">
      {showThumbnail && (
        <Image
          className="w-full h-full object-cover rounded-lg"
          src={article.thumbnail}
          alt={article.title}
          width="100%"
          height="100%"
          loading="lazy"
        />
      )}

      {showMedia && (
        <>
          {article.media_content_type?.startsWith('image/') && (
            <Image
              className="w-full h-full object-cover rounded-lg"
              src={article.media_content_url}
              alt={article.title}
              width="100%"
              height="100%"
              loading="lazy"
            />
          )}

          {article.media_content_type?.startsWith('video/') && (
            <>
              <Suspense fallback={<div>Loading video...</div>}>
                <LazyVideoPlayer url={article.media_content_url!} />
              </Suspense>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ThumbnailOrMedia;

