import {Suspense} from 'react';
import CreateCosmeticPopup from './CreateCosmeticPopUp';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import {Cosmetic} from "../../types/Cosmetic.tsx";



export default function CosmeticsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Cosmetic>
          title="Cosmetics"
          endpoint={`${import.meta.env.VITE_API_URL}/api/cosmetics`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'type', header: 'Type', cell: (d) => d.type },
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'display', header: 'Display', cell: (d) => d.display },
            { key: 'description', header: 'Description', cell: (d) => d.description },
          ]}
          searchAccessors={[(d) => d.id, (d) => d.display, (d) => d.description, (d) => d.type]}
          searchPlaceholder="Search cosmetics..."
          onRowClick={(d) => navigate(`/view/cosmetic/${d.id}`)}
          rowClickPermission="portal.cosmetics.modify"
          createPermission="portal.cosmetics.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateCosmeticPopup {...props} />
              </Suspense>
          )}
          emptyState="No Cosmetics available"
          emptyStateFiltered="No matching Cosmetic found"
      />
  );
}
