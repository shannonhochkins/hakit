import { Plugin } from "@measured/puck";
import { ComponentItem } from "../ComponentItem";


export const createPuckOverridesPlugin = (): Plugin => {
  return {
    overrides: {
      componentItem: ComponentItem
    },
  };
};
