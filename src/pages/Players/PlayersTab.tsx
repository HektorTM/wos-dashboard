import { useNavigate } from 'react-router-dom';
import {GenericListPage} from "../../components/TabComponent.tsx";

type Player = {
  username: string;
  uuid: string;
};

export default function DialogsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Player>
          title="Dialogs"
          endpoint={`${import.meta.env.VITE_API_URL}/api/playerdata`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.uuid}
          columns={[
            { key: 'username', header: 'Username', cell: (d) => d.username },
            { key: 'uuid', header: 'UUID', cell: (d) => d.uuid },
          ]}
          searchAccessors={[(d) => d.uuid, (d) => d.username]}
          searchPlaceholder="Search Players..."
          onRowClick={(d) => navigate(`/view/player/${d.uuid}`)}
          rowClickPermission=""
          createPermission=""
          CreatePopup={undefined}
          emptyState="No Players available"
          emptyStateFiltered="No matching Player found"
      />
  );
}
