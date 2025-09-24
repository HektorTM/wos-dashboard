import {Suspense} from 'react';

import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import CreateInteractionPopUp from "./CreateInteractionPopUp.tsx";


type Interaction = {
  id: string;
};

export default function InteractionsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Interaction>
          title="Interactions"
          endpoint={`${import.meta.env.VITE_API_URL}/api/interactions`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
          ]}
          searchAccessors={[(d) => d.id]}
          searchPlaceholder="Search interactions..."
          onRowClick={(d) => navigate(`/view/interaction/${d.id}`)}
          rowClickPermission="portal.interactions.modify"
          createPermission="portal.interactions.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateInteractionPopUp {...props} />
              </Suspense>
          )}
          emptyState="No Interactions available"
          emptyStateFiltered="No matching Interaction found"
      />
  );
}
