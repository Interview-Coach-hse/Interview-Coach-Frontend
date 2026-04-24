import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogsApi } from "@/features/catalogs/api/catalogs.api";

type Option = {
  value: string;
  label: string;
};

function toOptions(
  items: { code: string; name: string }[] | undefined,
  emptyLabel?: string,
): Option[] {
  return [
    ...(emptyLabel ? [{ value: "", label: emptyLabel }] : []),
    ...((items ?? []).map((item) => ({
      value: item.code,
      label: item.name,
    }))),
  ];
}

export function useCatalogs() {
  const directionsQuery = useQuery({
    queryKey: ["catalogs", "directions"],
    queryFn: catalogsApi.directions,
    staleTime: 5 * 60 * 1000,
  });

  const levelsQuery = useQuery({
    queryKey: ["catalogs", "levels"],
    queryFn: catalogsApi.levels,
    staleTime: 5 * 60 * 1000,
  });

  const directionMap = useMemo(
    () => new Map((directionsQuery.data ?? []).map((item) => [item.code, item.name])),
    [directionsQuery.data],
  );
  const levelMap = useMemo(
    () => new Map((levelsQuery.data ?? []).map((item) => [item.code, item.name])),
    [levelsQuery.data],
  );

  return {
    directionsQuery,
    levelsQuery,
    isLoading: directionsQuery.isLoading || levelsQuery.isLoading,
    isError: directionsQuery.isError || levelsQuery.isError,
    error: directionsQuery.error ?? levelsQuery.error,
    directionOptions: toOptions(directionsQuery.data, "Все направления"),
    levelOptions: toOptions(levelsQuery.data, "Все уровни"),
    directionSelectOptions: toOptions(directionsQuery.data),
    levelSelectOptions: toOptions(levelsQuery.data),
    getDirectionName: (code?: string | null) => (code ? directionMap.get(code) ?? code : "—"),
    getLevelName: (code?: string | null) => (code ? levelMap.get(code) ?? code : "—"),
  };
}
