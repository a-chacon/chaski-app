import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { getFolders } from "../helpers/feedsData";
import { useState, useEffect } from "react";
import { FeedInterface } from "../interfaces";

interface FolderItem {
  label: string; // Adjust this key name based on your needs
}

interface FolderFieldInterface {
  feed: FeedInterface;
}

export default function FolderField({ feed }: FolderFieldInterface) {
  const [availableFolders, setAvailableFolders] = useState<FolderItem[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      const response = await getFolders();
      const folders = response.map((folder) => ({ label: folder }));
      setAvailableFolders(folders);
    };

    fetchFolders();
  }, []);

  const onInputChange = (value: string) => {
    feed.folder = value;
  };

  return (
    <Autocomplete
      autoFocus={!feed.id}
      menuTrigger="input"
      allowsCustomValue
      label="Folder"
      items={availableFolders}
      defaultSelectedKey={feed.folder}
      onInputChange={onInputChange}
      variant="underlined"
    >
      {(item: FolderItem) => (
        <AutocompleteItem key={item.label} value={item.label}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}