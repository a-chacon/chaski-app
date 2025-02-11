import { Autocomplete, AutocompleteItem } from "@heroui/react";
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
      const response = await getFolders(feed.account_id);
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
      defaultItems={availableFolders}
      defaultSelectedKey={feed.folder}
      onInputChange={onInputChange}
    >
      {(item: FolderItem) => (
        <AutocompleteItem key={item.label} value={item.label}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
