import { useState } from 'react';
import { InstalledComponentsDashboard } from './InstalledComponentsDashboard';
import { ExploreModal } from './ExploreRepositoriesModal';
import { CustomRepoModal } from './CustomRepoModal';

export function ComponentsManager() {
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showCustomRepoModal, setShowCustomRepoModal] = useState(false);

  return (
    <>
      <InstalledComponentsDashboard onExploreComponents={() => setShowExploreModal(true)} />

      <ExploreModal
        isOpen={showExploreModal}
        onClose={() => setShowExploreModal(false)}
        onShowCustomRepo={() => {
          setShowExploreModal(false);
          setShowCustomRepoModal(true);
        }}
      />

      <CustomRepoModal
        isOpen={showCustomRepoModal}
        onClose={() => {
          setShowCustomRepoModal(false);
          setShowExploreModal(true);
        }}
      />
    </>
  );
}
