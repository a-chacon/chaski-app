import React from 'react';
import ReactPlayer from 'react-player';
import { ArticleInterface } from '../interfaces';

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
        <img
          className="w-full h-full object-cover rounded-lg"
          src={article.thumbnail}
          alt={article.title}
        />
      )}

      {showMedia && (
        <>
          {article.media_content_type?.startsWith('image/') && (
            <img
              className="w-full h-full object-cover rounded-lg"
              src={article.media_content_url}
              alt={article.title}
            />
          )}

          {article.media_content_type?.startsWith('video/') && (
            <ReactPlayer
              url={article.media_content_url}
              controls={true}
              width="100%"
              height="100%"
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ThumbnailOrMedia;

