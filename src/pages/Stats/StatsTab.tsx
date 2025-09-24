import {Suspense} from 'react';
import CreateStatPopup from './CreateStatPopUp';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";

type Stat = {
  id: string;
  max: string;
  capped: number;
};
export default function StatsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Stat>
          title="Stats"
          endpoint={`${import.meta.env.VITE_API_URL}/api/stats`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'max', header: 'Maximum', cell: (d) => d.max },
            { key: 'capped', boolean: true, header: 'Capped?', cell: (d) => d.capped },
          ]}
          searchAccessors={[(d) => d.id]}
          searchPlaceholder="Search stats..."
          onRowClick={(d) => navigate(`/view/stat/${d.id}`)}
          rowClickPermission="portal.stats.modify"
          createPermission="portal.stats.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateStatPopup {...props} />
              </Suspense>
          )}
          emptyState="No Stats available"
          emptyStateFiltered="No matching Stat found"
      />
  );
}
