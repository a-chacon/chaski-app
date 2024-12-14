import { Spinner } from "@nextui-org/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ArticleInterface } from "../interfaces";
import ArticleCard from "./ArticleCard";
import ArticleLayoutSwitch from "./ArticlesLayoutSwitch";
import { useAppContext } from "../AppContext";

interface IndexArticlesProps {
  articles: ArticleInterface[];
  fetchArticles: () => Promise<void>;
  hasMore: boolean;
  header: boolean;
}

function IndexArticles({
  articles,
  fetchArticles,
  hasMore,
  header,
}: IndexArticlesProps) {
  const { articlesLayout: display } = useAppContext();

  const GiphyEmbed = () => {
    return (
      <div className="w-80 mx-auto">
        <img src="/chaski.png" className="" alt="Tauri logo" />
        <div className="pb-6">
          <h5 className="text-2xl font-semibold text-center pb-2">
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
        {articles.map((article) => (
          <ArticleCard
            article={article}
            header={header}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}

export default IndexArticles;