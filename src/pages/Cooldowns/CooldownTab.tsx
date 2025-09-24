import {Suspense} from 'react';
import CreateCooldownPopup from "./CreateCooldownPopUp";
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";

type Cooldown = {
  id: string;
  duration: number;
  start_interaction: string;
  end_interaction: string;
};

export default function CooldownsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Cooldown>
          title="Cooldowns"
          endpoint={`${import.meta.env.VITE_API_URL}/api/cooldowns`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'duration', header: 'Duration', cell: (d) => d.duration },
            { key: 'startinteraction', header: 'Start Interaction', cell: (d) => d.start_interaction },
            { key: 'endinteraction', header: 'End Interaction', cell: (d) => d.end_interaction },
          ]}
          searchAccessors={[(d) => d.id]}
          searchPlaceholder="Search cooldowns..."
          onRowClick={(d) => navigate(`/view/cooldown/${d.id}`)}
          rowClickPermission="portal.cooldowns.modify"
          createPermission="portal.cooldowns.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateCooldownPopup {...props} />
              </Suspense>
          )}
          emptyState="No Cooldowns available"
          emptyStateFiltered="No matching Cooldown found"
      />
  );
}
