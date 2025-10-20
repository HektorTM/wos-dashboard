import {Suspense} from 'react';
import CreateGlobalStatPopUp from './CreateGlobalStatPopUp.tsx';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import {Globalstat} from "../../types/Globalstat.tsx";


export default function GlobalStatsPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Globalstat>
          title="Global Stats"
          endpoint={`${import.meta.env.VITE_API_URL}/api/globalstats`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'max', header: 'Maximum', cell: (d) => d.max },
            { key: 'capped', boolean: true, header: 'Capped?', cell: (d) => d.capped },
            { key: 'amount', header: 'Amount', cell: (d) => d.value }
          ]}
          searchAccessors={[(d) => d.id]}
          searchPlaceholder="Search global stats..."
          onRowClick={(d) => navigate(`/view/globalstat/${d.id}`)}
          rowClickPermission="portal.stats.modify"
          createPermission="portal.stats.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateGlobalStatPopUp {...props} />
              </Suspense>
          )}
          emptyState="No Global Stats available"
          emptyStateFiltered="No matching Global Stat found"
      />
  );
}
