import {Suspense} from 'react';
import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import CreateConstantPopup from "./CreateConstantPopUp.tsx";
import {Constant} from "../../types/Constant.tsx";


export default function UnlockablesPage() {
    const navigate = useNavigate();

    return (
        <GenericListPage<Constant>
            title="Constants"
            endpoint={`${import.meta.env.VITE_API_URL}/api/constants`}
            requestInit={{ credentials: 'include' }}
            getId={(d) => d.id}
            columns={[
                { key: 'id', header: 'Identifier', cell: (d) => d.id },
                { key: 'value', header: 'Value', cell: (d) => d.value },
            ]}
            searchAccessors={[(d) => d.id]}
            searchPlaceholder="Search constants..."
            onRowClick={(d) => navigate(`/view/constant/${d.id}`)}
            rowClickPermission="portal.constants.modify"
            createPermission="portal.constants.create"
            CreatePopup={ (props) => (
                <Suspense fallback={<div>Loading popup...</div>}>
                    <CreateConstantPopup {...props} />
                </Suspense>
            )}
            emptyState="No Constants available"
            emptyStateFiltered="No matching Constant found"
        />
    );
}
