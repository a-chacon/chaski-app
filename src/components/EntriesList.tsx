import { Spinner } from "@heroui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ArticleInterface } from "../interfaces";
import ArticleCard from "./ArticleCard";
import ArticleLayoutSwitch from "./ArticlesLayoutSwitch";
import { useAppContext } from "../AppContext";

interface EntriesListProps {
  articles: ArticleInterface[];
  fetchArticles: () => Promise<void>;
  hasMore: boolean;
  header: boolean;
}

function EntriesList({
  articles,
  fetchArticles,
  hasMore,
  header,
}: EntriesListProps) {
  const { articlesLayout: display } = useAppContext();

  const GiphyEmbed = () => {
    return (
      <div className="mx-auto col-span-3">
        <div className="pb-6 text-center">
          <h5 className="text-2xl font-semibold pb-2">
            We've reached the end of the road…
          </h5>
          <p>But don’t fret, our Chasquis are already off to bring more!</p>
        </div>
      </div>
    );
  };

  return (
    <div key="articles">
      <ArticleLayoutSwitch></ArticleLayoutSwitch>
      <InfiniteScroll
        dataLength={articles.length} //This is important field to render the next data
        next={fetchArticles}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center p-6">
            <Spinner color="default" />
          </div>
        }
        scrollableTarget="mainDiv"
        endMessage={GiphyEmbed()}
        className={
          display == "card"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            : ""
        }
      >
        {articles.map((article) => {
          switch (article.content_type) {
            // case 'podcast':
            //   return (
            //     <PodcastCard
            //       key={article.id}
            //       article={article}
            //       header={header}
            //     />
            //   );
            case 'image':
              return (
                <ImageCard
                  key={article.id}
                  article={article}
                  header={header}
                />
              );
            case 'video':
              return (
                <VideoCard
                  key={article.id}
                  article={article}
                  header={header}
                />
              );
            case 'comment':
              return (
                <CommentCard
                  key={article.id}
                  article={article}
                  header={header}
                />
              );
            case 'article':
            default:
              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  header={header}
                />
              );
          }
        })}
      </InfiniteScroll>
    </div>
  );
}

export default EntriesList;
