import CatalogManager from "../../components/admin/CatalogManager";
import { listCategories, createCategory, updateCategory, deactivateCategory } from "../../api/catalog";

export default function AdminCategories() {
  return (
    <CatalogManager
      title="التصنيفات"
      icon="fa-tags"
      listFn={listCategories}
      createFn={createCategory}
      updateFn={updateCategory}
      deactivateFn={deactivateCategory}
    />
  );
}
