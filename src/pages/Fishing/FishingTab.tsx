import {Suspense, } from 'react';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import CreateFishPopup from "./CreateFishPopUp.tsx";

type Fish = {
  id: string;
  citem_id: string;
  catch_interaction: string;
  rarity: string;
  regions: string;
}

export default function DialogsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Fish>
          title="Fishing"
          endpoint={`${import.meta.env.VITE_API_URL}/api/fishies`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'rarity', header: 'Rarity', cell: (d) => d.rarity },
            { key: 'itemid', header: 'Citem ID', cell: (d) => d.citem_id },
            { key: 'catchinteraction', header: 'Catch Interaction', cell: (d) => d.catch_interaction },
            { key: 'regions', header: 'Regions', cell: (d) => d.regions },
          ]}
          searchAccessors={[(d) => d.id, (d) => d.citem_id]}
          searchPlaceholder="Search Fish..."
          onRowClick={(d) => navigate(`/view/fish/${d.id}`)}
          rowClickPermission="portal.fishing.modify"
          createPermission="portal.fishing.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateFishPopup {...props} />
              </Suspense>
          )}
          emptyState="No Fish available"
          emptyStateFiltered="No matching Fish found"
      />
  );
}
