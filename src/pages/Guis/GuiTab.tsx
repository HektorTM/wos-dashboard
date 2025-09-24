import {Suspense} from 'react';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import CreateGuiPopup from "./CreateGuiPopUp.tsx";

type Gui = {
  id: string;
};

export default function GuiPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Gui>
          title="GUI"
          endpoint={`${import.meta.env.VITE_API_URL}/api/guis`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
          ]}
          searchAccessors={[(d) => d.id, (d) => d.id]}
          searchPlaceholder="Search Guis..."
          onRowClick={(d) => navigate(`/view/guis/${d.id}`)}
          rowClickPermission="portal.guis.modify"
          createPermission="portal.guis.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateGuiPopup {...props} />
              </Suspense>
          )}
          emptyState="No GUI available"
          emptyStateFiltered="No matching GUI found"
      />
  );
}