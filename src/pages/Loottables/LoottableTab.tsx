import {Suspense} from 'react';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import {Loottable} from "../../types/Loottable.tsx";
import CreateLoottablePopUp from "./CreateLoottablePopUp.tsx";

export default function LoottableTab() {
    const navigate = useNavigate();

    return (
        <GenericListPage<Loottable>
            title="Loot tables"
            endpoint={`${import.meta.env.VITE_API_URL}/api/loottables`}
            requestInit={{ credentials: 'include' }}
            getId={(d) => d.id}
            columns={[
                { key: 'id', header: 'Identifier', cell: (d) => d.id },
                { key: 'amount', header: 'Amount', cell: (d) => d.amount },
                { key: 'name', header: 'Name', cell: (d) => d.name}
            ]}
            searchAccessors={[(d) => d.id]}
            searchPlaceholder="Search loottables..."
            onRowClick={(d) => navigate(`/view/loottable/${d.id}`)}
            rowClickPermission="portal.loottables.modify"
            createPermission="portal.loottables.create"
            CreatePopup={ (props) => (
                <Suspense fallback={<div>Loading popup...</div>}>
                    <CreateLoottablePopUp {...props} />
                </Suspense>
            )}
            emptyState="No Loottables available"
            emptyStateFiltered="No matching Loottable found"
        />
    );
}
