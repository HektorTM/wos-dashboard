import {Suspense} from 'react';
import CreateTimePopUp from './CreateTimePopUp.tsx';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";

type TimeEvent = {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  date: string;
  start_time: number;
  end_time: number;
  start_interaction: string;
  end_interaction: string;
};
export default function TimePage() {
  const navigate = useNavigate();

  return (
      <GenericListPage<TimeEvent>
          title="Time Events"
          endpoint={`${import.meta.env.VITE_API_URL}/api/timeevents`}
          requestInit={{ credentials: 'include' }}
          getId={(d) => d.id}
          columns={[
            { key: 'id', header: 'Identifier', cell: (d) => d.id },
            { key: 'name', header: 'Name', cell: (d) => d.name },
            { key: 'date', header: 'Date', cell: (d) => d.date },
            { key: 'starttime', header: 'Start Time', cell: (d) => d.start_time },
            { key: 'endtime', header: 'End Time', cell: (d) => d.end_time },
          ]}
          searchAccessors={[(d) => d.id, (d) => d.name, (d) => d.date]}
          searchPlaceholder="Search Time Events..."
          onRowClick={(d) => navigate(`/view/timeevent/${d.id}`)}
          rowClickPermission="portal.timeevents.modify"
          createPermission="portal.timeevents.create"
          CreatePopup={ (props) => (
              <Suspense fallback={<div>Loading popup...</div>}>
                <CreateTimePopUp {...props} />
              </Suspense>
          )}
          emptyState="No Time Events available"
          emptyStateFiltered="No matching Time Event found"
      />
  );
}
