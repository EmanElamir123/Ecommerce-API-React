import CatalogManager from "../../components/admin/CatalogManager";
import { listBrands, createBrand, updateBrand, deactivateBrand } from "../../api/catalog";

export default function AdminBrands() {
  return (
    <CatalogManager
      title="الماركات"
      icon="fa-copyright"
      listFn={listBrands}
      createFn={createBrand}
      updateFn={updateBrand}
      deactivateFn={deactivateBrand}
    />
  );
}
