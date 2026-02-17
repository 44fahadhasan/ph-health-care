/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IPrismaModel {
  findMany(args?: any): Promise<any[]>;
  count(args?: any): Promise<number>;
}

export interface IPrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown>;
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string | string[];
  [key: string]: unknown;
}

export interface IPrismaCountArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown>;
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string | string[];
  [key: string]: unknown;
}

export interface IQueryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
  include?: string;
  [key: string]: string | undefined | Record<string, any>;
}

export interface IQueryConfig {
  searchAbleFields?: string[];
  filterAbleFields?: string[];
}

export interface IPrismaStringFilter {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "insensitive";
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  not?: string | IPrismaStringFilter;
}

export interface IPrismaNumberFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: number | IPrismaNumberFilter;
}

export interface IPrismaWhereConditions {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface IQueryResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
