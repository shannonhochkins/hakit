import { type Config, walkTree } from '@measured/puck';
import { type PuckPageData } from '@typings/puck';
import { create } from 'zustand';
import { useGlobalStore } from './useGlobalStore';
import { COMPONENT_TYPE_DELIMITER } from '@helpers/editor/pageData/constants';

/**
 * This store will manage a list of popup ids
 * - An action to set a list of popups, where it'll have an object of id, and open state
 * - An action to remove a popup by id
 * - An action to "open" a popup, or set the state of the popup to open
 * - An action to "close" a popup, or set the state of the popup to closed
 * - If the openPopup action receives an id that doesn't exist, it should throw an error
 * - If the closePopup action receives an id that doesn't exist, it should throw an error
 */

type PopupState = {
  id: string;
  isOpen: boolean;
};

interface PopupStore {
  popups: PopupState[];
  removePopup: (id: string) => void;
  openPopup: (id: string) => void;
  closeAllPopups: () => void;
  closePopup: (id: string) => void;
  initializePopups: (data: PuckPageData) => void;
}

export function getPopupIdsInData(data: PuckPageData, userConfig: Config): Set<string> {
  const popupIds = new Set<string>();
  try {
    walkTree(data, userConfig, content => {
      content.forEach(item => {
        if (item.type?.startsWith(`Popup${COMPONENT_TYPE_DELIMITER}@hakit`) && item.props.id) {
          popupIds.add(item.props.id);
        }
      });
    });
  } catch {
    // possible this will fail early if the data contains a component name that does not exist in the userConfig
    // this will be called automatically again after the trimPuckDataToConfig is called again.
  }
  return popupIds;
}

export const usePopupStore = create<PopupStore>(set => {
  return {
    popups: [],
    // this must be called after we've set the puckPageData on the global store
    initializePopups: data => {
      const userConfig = useGlobalStore.getState().userConfig;
      if (!userConfig) return;
      // walk the puck page data to find all popups
      const popupIds = getPopupIdsInData(data, userConfig as Config);

      set(state => {
        // Preserve existing popups (and their isOpen state) and add any new ones
        const existingMap = new Map(state.popups.map(p => [p.id, p] as const));
        popupIds.forEach(id => {
          if (!existingMap.has(id)) {
            existingMap.set(id, { id, isOpen: false });
          }
        });

        // prune popups no longer present in data.
        for (const existingId of Array.from(existingMap.keys())) {
          if (!popupIds.has(existingId)) existingMap.delete(existingId);
        }
        return { popups: Array.from(existingMap.values()) };
      });
    },
    // when we're removing a popup, we need to walk the three and filter out any popups with the matching id
    removePopup: id => set(state => ({ popups: state.popups.filter(popup => popup.id !== id) })),
    openPopup: id =>
      set(state => {
        const popup = state.popups.find(popup => popup.id === id);
        if (!popup) throw new Error(`Popup with id ${id} not found`);
        return {
          popups: state.popups.map(popup => (popup.id === id ? { ...popup, isOpen: true } : popup)),
        };
      }),
    closeAllPopups: () =>
      set(state => ({
        popups: state.popups.map(popup => ({ ...popup, isOpen: false })),
      })),
    closePopup: id =>
      set(state => {
        const popup = state.popups.find(popup => popup.id === id);
        if (!popup) throw new Error(`Popup with id ${id} not found`);
        return {
          popups: state.popups.map(popup => (popup.id === id ? { ...popup, isOpen: false } : popup)),
        };
      }),
  };
});
