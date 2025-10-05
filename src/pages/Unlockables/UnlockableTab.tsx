import {Suspense} from 'react';
import CreateUnlockablePopUp from './CreateUnlockablePopUp';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import {Unlockable} from "../../types/Unlockable.tsx";

export default function UnlockablesPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Unlockable>
          title="Unlockables"
          endpoint={`${import.meta.env.VITE_API_URL}/api/unlockables`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'temp', header: 'Temporary?', cell: (d) => d.temp },
          ]}
          searchAccessors={[(d) => d.id]}
          searchPlaceholder="Search unlocakbles..."
          onRowClick={(d) => navigate(`/view/unlockable/${d.id}`)}
          rowClickPermission="portal.unlockables.modify"
          createPermission="portal.unlockables.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateUnlockablePopUp {...props} />
              </Suspense>
          )}
          emptyState="No Unlockables available"
          emptyStateFiltered="No matching Unlocakble found"
      />
  );
}
