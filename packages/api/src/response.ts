import { z } from "zod";
export type PaginatedResponse<T = unknown> = {
  data: T;
  total: number;
};
export const makePaginatedResponseSchema = <T extends z.ZodTypeAny>(
  data: T,
) => {
  return z.object({
    data: data,
    total: z.number().gte(0),
  });
};

export const EMPTY_PAGINATED_RESPONSE: PaginatedResponse = {
  data: [],
  total: 0,
};
