import { request } from "@/api";

export type CatalogItem = {
  id: string;
  code: string;
  name: string;
};

export const catalogsApi = {
  directions: () =>
    request<CatalogItem[]>("/admin/directions", {
      auth: false,
    }),
  levels: () =>
    request<CatalogItem[]>("/admin/levels", {
      auth: false,
    }),
};
