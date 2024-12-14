import { ConfigurationInterface } from "../interfaces";
import { invoke } from "@tauri-apps/api/core";

export const indexConfigurations = async () => {
  try {
    const message = await invoke<string>("list_configurations");

    const response: ConfigurationInterface[] = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error indexing configurations:", error);
    throw new Error("Failed to indexing configurations");
  }
};

export const updateConfiguration = async (
  configuration: ConfigurationInterface,
) => {
  try {
    let id = configuration.id || 0;
    const message = await invoke<string>("update_configuration", {
      configurationId: id,
      configuration: configuration,
    });

    const updated_configuratio: ConfigurationInterface = JSON.parse(message);

    return updated_configuratio;
  } catch (error) {
    console.error("Error updating configuration:", error);
    throw new Error("Failed to update configuration");
  }
};
