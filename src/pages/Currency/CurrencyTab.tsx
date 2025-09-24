import {Suspense} from 'react';
import CreateCurrencyPopup from './CreateCurrencyPopUp';
import {useNavigate} from "react-router-dom";
import { GenericListPage } from '../../components/TabComponent.tsx';

type Currency = {
  id: string;
  name: string;
  short_name: string;
  icon: string;
  color: string;
  hidden_if_zero: number;
};

export default function CurrencyPage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<Currency>
          title="Currencies"
          endpoint={`${import.meta.env.VITE_API_URL}/api/currencies`}
          requestInit={{ credentials: 'include' }}
          getId={(c) => c.id}
          columns={[
            { key: 'icon', header: 'Identifier', cell: (d) => d.icon },
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'name', header: 'Character Name', cell: (d) => d.name },
            { key: 'short-name', header: 'Short Name', cell: (d) => d.short_name },
            { key: 'color', header: 'Color', cell: (d) => d.color },
            { key: 'hiddenifzero', boolean: true, header: 'Hidden if Zero', cell: (d) => d.hidden_if_zero },
          ]}
          searchAccessors={[(d) => d.id, (d) => d.name, (d) => d.short_name]}
          searchPlaceholder="Search Currencies..."
          onRowClick={(d) => navigate(`/view/currency/${d.id}`)}
          rowClickPermission="portal.currencies.modify"
          createPermission="portal.currencies.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateCurrencyPopup {...props} />
              </Suspense>
          )}
          emptyState="No Currencies available"
          emptyStateFiltered="No matching Currency found"
      />
  );
}

