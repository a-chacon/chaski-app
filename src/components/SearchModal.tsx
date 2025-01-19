import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import { RiSearchLine, RiCloseLine, RiSearch2Line } from "@remixicon/react";
import { useEffect, useState } from "react";
import { fullTextSearch } from "../helpers/searchData";
import { SearchResultsInterface } from "../interfaces";
import { Link } from "@tanstack/react-router";

export default function SearchModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResultsInterface>({
    feeds: [],
    articles: [],
  });

  useEffect(() => {
    setValue("");
    setResults({ feeds: [], articles: [] });
  }, [isOpen]);

  const handleInputChange = async (input: string) => {
    setValue(input);
    if (input.length >= 3) {
      let result = await fullTextSearch(input);
      if (result) {
        setResults(result);
      }
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        variant="flat"
        isIconOnly
        className="rounded-full items-center h-10 w-10 flex justify-center"
      >
        <RiSearchLine className="p-0.5" />
      </Button>

      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        radius="lg"
        hideCloseButton={true}
        scrollBehavior="inside"
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <Input
                  startContent={<RiSearch2Line></RiSearch2Line>}
                  endContent={
                    <Button
                      onPress={onClose}
                      size="sm"
                      isIconOnly
                      color="primary"
                      variant="light"
                      aria-label="Like"
                    >
                      <RiCloseLine />
                    </Button>
                  }
                  value={value}
                  onValueChange={handleInputChange}
                  autoFocus
                  variant="underlined"
                />
              </ModalHeader>
              <ModalBody>
                {results.feeds.length === 0 && results.articles.length === 0 ? (
                  <p className="p-10 text-center">No results found.</p>
                ) : (
                  <>
                    <h2 className="font-semibold">Feeds</h2>
                    <ul>
                      {results.feeds.map((feed) => (
                        <li key={feed.id} className="py-2">
                          <Link
                            to="/feeds/$feedId"
                            params={{ feedId: feed.id || "" }}
                            onClick={() => {
                              onClose();
                            }}
                          >
                            <Card>
                              <CardBody>
                                <p className="line-clamp-1">
                                  {feed.title} -{" "}
                                  <span className="text-sm">
                                    {feed.description}
                                  </span>
                                </p>
                              </CardBody>
                            </Card>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <h2 className="font-semibold">Articles</h2>
                    <ul>
                      {results.articles.map((article) => (
                        <li key={article.id} className="py-2">
                          <Link
                            to="/articles/$articleId"
                            params={{ articleId: article.id?.toString() || "" }}
                            onClick={() => {
                              onClose();
                            }}
                          >
                            <Card>
                              <CardBody>
                                <p className="line-clamp-1">{article.title}</p>
                              </CardBody>
                            </Card>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
