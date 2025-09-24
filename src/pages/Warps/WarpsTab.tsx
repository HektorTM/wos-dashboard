import {GenericListPage} from "../../components/TabComponent.tsx";

type Warp = {
  id: string;
  location: string;
};

export default function DialogsPage() {

  return (
      <GenericListPage<Warp>
          title="Warps"
          endpoint={`${import.meta.env.VITE_API_URL}/api/warps`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'location', header: 'Location', cell: (d) => d.location },
          ]}
          searchAccessors={[(d) => d.id, (d) => d.location]}
          searchPlaceholder="Search warps..."
          onRowClick={undefined}
          rowClickPermission=""
          createPermission=""
          CreatePopup={undefined}
          emptyState="No Warps available"
          emptyStateFiltered="No matching Warp found"
      />
  );
}
