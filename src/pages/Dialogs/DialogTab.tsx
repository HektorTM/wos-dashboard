import {useNavigate} from "react-router-dom";
import {GenericListPage} from "../../components/TabComponent.tsx";
import {Suspense} from "react";
import CreateDialogPopup from "../Dialogs/CreateDialogPopUp.tsx";
import {DialogList} from "../../types/Dialog.tsx";

export default function DialogsPage() {
    const navigate = useNavigate();

    return (
        <GenericListPage<DialogList>
            title="Dialogs"
            endpoint={`${import.meta.env.VITE_API_URL}/api/dialogs`}
            requestInit={{credentials: 'include'}}
            getId={(d) => d.dialog_id}
            columns={[
                {key: 'id', header: 'Identifier', cell: (d) => d.dialog_id},
                {key: 'name', header: 'Character Name', cell: (d) => d.char_name},
            ]}
            searchAccessors={[(d) => d.dialog_id, (d) => d.char_name]}
            searchPlaceholder="Search dialogs..."
            onRowClick={(d) => navigate(`/view/dialog/${d.dialog_id}`)}
            rowClickPermission="portal.dialogs.modify"
            createPermission="portal.dialogs.create"
            CreatePopup={(props) => (
                <Suspense fallback={<div>Loading popup...</div>}>
                    <CreateDialogPopup {...props} />
                </Suspense>
            )}
            emptyState="No Dialogs available"
            emptyStateFiltered="No matching Dialog found"
        />
    );
}
