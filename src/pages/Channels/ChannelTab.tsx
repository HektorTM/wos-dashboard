import {GenericListPage} from "../../components/TabComponent.tsx";

type Channel = {
  name: string;
  short_name: string;
  color: string;
  format: string;
  default_channel: boolean;
  autojoin: boolean;
  forcejoin: boolean;
  hidden: boolean;
  broadcastable: boolean;
  permission: string | null;
  radius: number;
};

export default function ChannelsPage() {

  return (
      <GenericListPage<Channel>
          title="Dialogs"
          endpoint={`${import.meta.env.VITE_API_URL}/api/dialogs`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.name}
          columns={[
            { key: 'name', header: 'Name', cell: (d) => d.name },
            { key: 'shortname', header: 'Short Name', cell: (d) => d.short_name },
            { key: 'color', header: 'Color', cell: (d) => d.color },
            { key: 'format', header: 'Format', cell: (d) => d.format },
            { key: 'defaultchannel', boolean: true, header: 'Default Channel?', cell: (d) => d.default_channel },
            { key: 'autojoin', boolean: true, header: 'Auto Join?', cell: (d) => d.autojoin },
            { key: 'forcejoin', boolean: true, header: 'Force Join?', cell: (d) => d.forcejoin },
            { key: 'hidden', boolean: true, header: 'Hidden?', cell: (d) => d.hidden },
            { key: 'broadcastable', boolean: true, header: 'Broadcastable?', cell: (d) => d.broadcastable },
            { key: 'permission', header: 'Permission', cell: (d) => d.permission },
            { key: 'radius', header: 'Radius', cell: (d) => d.radius },
          ]}
          searchAccessors={[(d) => d.name, (d) => d.short_name, (d) => d.permission]}
          searchPlaceholder="Search channels..."
          onRowClick={undefined}
          rowClickPermission=""
          createPermission=""
          CreatePopup={undefined}
          emptyState="No Channels available"
          emptyStateFiltered="No matching Channel found"
      />
  );
}
