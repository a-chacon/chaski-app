import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { FeedInterface, FilterInterface } from "../interfaces";
import { useState, useEffect } from "react";
import { RiAddLine } from "@remixicon/react";
import FilterItem from "./FilterItem";
import {
  createFilter,
  updateFilter,
  destroyFilter,
  indexFilters,
} from "../helpers/filtersData";

interface FeedSiteFiltersModalProps {
  feed: FeedInterface;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FeedSiteFiltersModal: React.FC<FeedSiteFiltersModalProps> = ({
  feed,
  isOpen,
  onOpenChange,
}) => {
  const [filters, setFilters] = useState<FilterInterface[]>([]);

  useEffect(() => {
    setCurrentFilters();
  }, [feed]);

  const setCurrentFilters = async () => {
    let current_filters = await indexFilters(parseInt(feed.id!.toString()));
    setFilters(current_filters);
  };

  const handleNewFilter = async () => {
    let filter = await createFilter({
      field: "",
      operator: "",
      value: "",
      logical_operator: "AND",
      feed_id: parseInt(feed.id!.toString()),
    });

    setFilters([...filters, { ...filter }]);
  };

  const handleRemoveFilter = (index: number) => {
    destroyFilter(filters[index].id || 1);

    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (
    index: number,
    updatedFilter: FilterInterface,
  ) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = updatedFilter;
    setFilters(updatedFilters);
    console.log(updatedFilter);
    updateFilter(updatedFilter);
  };

  return (
    <Modal
      key={"filters-" + feed.id}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Filter entries
            </ModalHeader>
            <ModalBody>
              <span className="text-sm">
                Entries don't match this filters will be discarded. If there is
                not filters then all entries are added.
              </span>
              <div className="mt-4">
                {filters.map((filter, index) => (
                  <FilterItem
                    key={index}
                    index={index}
                    filter={filter}
                    onFilterChange={handleFilterChange}
                    onRemove={handleRemoveFilter}
                    isLast={filters.length == index + 1}
                  />
                ))}{" "}
              </div>

              <div className="mx-auto">
                <Button isIconOnly variant="light" onClick={handleNewFilter}>
                  <RiAddLine />
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onCloseModal}>
                Close
              </Button>
              <Button color="success" variant="flat" onPress={onCloseModal}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FeedSiteFiltersModal;
