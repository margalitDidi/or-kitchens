import { queryOptions } from "@tanstack/react-query";
import { getProject, getSiteContent } from "./site.functions";

export const siteContentQuery = () =>
  queryOptions({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    staleTime: 60_000,
  });

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["project", id],
    queryFn: () => getProject({ data: { id } }),
    staleTime: 60_000,
  });
