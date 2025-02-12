import React from "react";
import { Select, SelectItem, Input, Button } from "@heroui/react"; // Adjust based on your UI library
import { FilterInterface } from "../interfaces";
import { RiCloseLine } from "@remixicon/react";

interface FilterItemProps {
  index: number;
  filter: FilterInterface;
  onFilterChange: (index: number, updatedFilter: FilterInterface) => void;
  onRemove: (index: number) => void;
  isLast: boolean;
}

const FilterItem: React.FC<FilterItemProps> = ({
  index,
  filter,
  onFilterChange,
  onRemove,
  isLast,
}) => {
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(index, { ...filter, field: e.target.value });
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(index, { ...filter, operator: e.target.value });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(index, { ...filter, value: e.target.value });
  };

  const handleLogicalOperatorChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFilterChange(index, { ...filter, logical_operator: e.target.value });
  };

  return (
    <div className="flex flex-col gap-1 justify-between mb-2">
      <div className="flex flex-row gap-2 items-center">
        <Select
          label="Field"
          value={filter.field}
          onChange={handleFieldChange}
          defaultSelectedKeys={[filter.field]}
          className="max-w-xs"
          size="sm"
          variant="underlined"
        >
          <SelectItem key="LINK">Link</SelectItem>
          <SelectItem key="TITLE">Title</SelectItem>
          <SelectItem key="DESCRIPTION">Description</SelectItem>
        </Select>

        <Select
          label="Operator"
          value={filter.operator}
          onChange={handleOperatorChange}
          className="max-w-xs"
          size="sm"
          defaultSelectedKeys={[filter.operator]}
          variant="underlined"
        >
          <SelectItem key="CONTAINS">Contains</SelectItem>
          <SelectItem key="NO_CONTAINS">No Contains</SelectItem>
          <SelectItem key="STARTS_WITH">Start with</SelectItem>
          <SelectItem key="ENDS_WITH">End With</SelectItem>
        </Select>

        <Input
          type="text"
          label="Value"
          value={filter.value}
          onChange={handleValueChange}
          className="max-w-xs"
          size="sm"
          variant="underlined"
        />

        <Button
          onPress={() => onRemove(index)}
          color="danger"
          variant="light"
          isIconOnly
          size="sm"
        >
          <RiCloseLine></RiCloseLine>
        </Button>
      </div>

      {!isLast && (
        <div className="mx-auto">
          <Select
            label="Connector"
            defaultSelectedKeys={[filter.logical_operator]}
            onChange={handleLogicalOperatorChange}
            className="w-24"
            size="sm"
            variant="underlined"
          >
            <SelectItem key="AND">And</SelectItem>
            <SelectItem key="OR">Or</SelectItem>
          </Select>
        </div>
      )}
    </div>
  );
};

export default FilterItem;
