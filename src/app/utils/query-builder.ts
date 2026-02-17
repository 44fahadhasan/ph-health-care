import {
  IPrismaCountArgs,
  IPrismaFindManyArgs,
  IPrismaModel,
  IPrismaNumberFilter,
  IPrismaStringFilter,
  IPrismaWhereConditions,
  IQueryConfig,
  IQueryParams,
  IQueryResult,
} from "../interfaces/query.interface";

export class QueryBuilder<
  TModel,
  TWhereInput = Record<string, unknown>,
  IInclude = Record<string, unknown>,
> {
  private page: number = 1;
  private skip: number = 0;
  private limit: number = 10;
  private sortBy: string = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";
  private query: IPrismaFindManyArgs;
  private countQuery: IPrismaCountArgs;
  private selectFields?: Record<string, boolean> | undefined;

  constructor(
    private model: IPrismaModel,
    private queryParams: IQueryParams,
    private queryConfig: IQueryConfig = {},
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };

    this.countQuery = {
      where: {},
    };
  }

  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchAbleFields } = this.queryConfig;

    if (searchTerm && searchAbleFields && searchAbleFields.length > 0) {
      const searchConditions: Record<string, unknown>[] = searchAbleFields.map(
        (field) => {
          const stringFilter: IPrismaStringFilter = {
            contains: searchTerm,
            mode: "insensitive",
          };

          if (field.includes(".")) {
            const parts = field.split(".");

            if (parts.length === 2) {
              const [relation, nestedField] = parts;

              return {
                [relation]: {
                  [nestedField]: stringFilter,
                },
              };
            }

            if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;

              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter,
                    },
                  },
                },
              };
            }
          }

          return { [field]: stringFilter };
        },
      );

      const whereConditions = this.query.where as IPrismaWhereConditions;
      const countWhereConditions = this.countQuery
        .where as IPrismaWhereConditions;

      whereConditions.OR = searchConditions;
      countWhereConditions.OR = searchConditions;
    }

    return this;
  }

  filter(): this {
    const { filterAbleFields } = this.queryConfig;

    const excludeFields = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "include",
      "fields",
    ];

    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludeFields.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });

    const queryWhere = this.query.where as Record<string, unknown>;
    const countQueryWhere = this.countQuery.where as Record<string, unknown>;

    Object.entries(filterParams).forEach(([key, value]) => {
      if (value === undefined || value === "") return;

      const isAllowed =
        !filterAbleFields ||
        filterAbleFields.length === 0 ||
        filterAbleFields.includes(key);

      if (!isAllowed) return;

      if (key.includes(".")) {
        const parts = key.split(".");

        if (parts.length === 2) {
          const [relation, field] = parts;

          queryWhere[relation] = {
            some: {
              [field]: this.parseFilterValue(value),
            },
          };

          countQueryWhere[relation] = {
            some: {
              [field]: this.parseFilterValue(value),
            },
          };

          return;
        }

        if (parts.length === 3) {
          const [relation, nestedRelation, field] = parts;

          queryWhere[relation] = {
            some: {
              [nestedRelation]: {
                [field]: this.parseFilterValue(value),
              },
            },
          };

          countQueryWhere[relation] = {
            some: {
              [nestedRelation]: {
                [field]: this.parseFilterValue(value),
              },
            },
          };

          return;
        }
      }

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        queryWhere[key] = this.parserFilterRange(
          value as Record<string, string | number>,
        );
        countQueryWhere[key] = this.parserFilterRange(
          value as Record<string, string | number>,
        );
        return;
      }

      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });

    return this;
  }

  fields(): this {
    const fieldsParams = this.queryParams.fields;

    if (fieldsParams && typeof fieldsParams === "string") {
      const fieldsArray = fieldsParams.split(",").map((field) => field.trim());

      this.selectFields = {};

      fieldsArray.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });

      this.query.select = this.selectFields as Record<
        string,
        boolean | Record<string, unknown>
      >;

      delete this.query.include;
    }

    return this;
  }

  include(relation: IInclude): this {
    if (this.selectFields) return this;

    this.query.include = {
      ...(relation as Record<string, unknown>),
      ...(this.query.include as Record<string, unknown>),
    };

    return this;
  }

  dynamicInclude(
    includeConfig: Record<string, unknown>,
    defaultInclude?: string[],
  ): this {
    if (this.selectFields) return this;

    const result: Record<string, unknown> = {};

    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });

    const includeParams = this.queryParams.include as string | undefined;

    if (includeParams && typeof includeParams === "string") {
      const requestRelations = includeParams.split(",").map((r) => r.trim());

      requestRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }

    this.query.include = {
      ...result,
      ...(this.query.include as Record<string, unknown>),
    };

    return this;
  }

  where(condition: TWhereInput): this {
    const queryWhere = this.deepMerge(
      this.query.where as Record<string, unknown>,
      condition as Record<string, unknown>,
    );

    const countWhere = this.deepMerge(
      this.countQuery.where as Record<string, unknown>,
      condition as Record<string, unknown>,
    );

    this.query.where = queryWhere;
    this.countQuery.where = countWhere;

    return this;
  }

  sort(): this {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";

    this.sortBy = sortBy;
    this.sortOrder = sortOrder;

    const parts = sortBy.split(".");

    if (parts.length === 1) {
      this.query.orderBy = {
        [sortBy]: sortOrder,
      };

      return this;
    }

    if (parts.length === 2) {
      const [relation, field] = parts;

      this.query.orderBy = {
        [relation]: {
          [field]: sortOrder,
        },
      };

      return this;
    }

    this.query.orderBy = {
      createdAt: "desc",
    };

    return this;
  }

  pagination(): this {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;

    this.query.skip = this.skip;
    this.query.take = this.limit;

    return this;
  }

  async count(): Promise<number> {
    return await this.model.count(this.countQuery);
  }

  async execute(): Promise<IQueryResult<TModel>> {
    const [total, data] = await Promise.all([
      this.count(),
      this.model.findMany(this.query),
    ]);

    const totalPages = Math.ceil(total / this.limit);

    return {
      data: data as TModel[],
      meta: {
        total,
        page: this.page,
        limit: this.limit,
        totalPages,
      },
    };
  }

  getQuery(): IPrismaFindManyArgs {
    return this.query;
  }

  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): Record<string, unknown> {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (
          result[key] &&
          typeof result[key] === "object" &&
          !Array.isArray(result[key])
        ) {
          result[key] = this.deepMerge(
            result[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>,
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private parserFilterRange(
    value: Record<string, string | number>,
  ): IPrismaNumberFilter | IPrismaStringFilter {
    const rangeQuery: Record<string, unknown> = {};

    Object.entries(value).forEach(([operator, raw]) => {
      const parsed =
        typeof raw === "string" && !isNaN(Number(raw)) ? Number(raw) : raw;

      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsed;
          break;
        case "in":
        case "notIn":
          rangeQuery[operator] = Array.isArray(raw) ? raw : [parsed];
          break;
      }
    });

    return rangeQuery;
  }

  private parseFilterValue(value: unknown): unknown {
    if (value === "true") return true;
    if (value === "false") return false;

    if (typeof value === "string" && value.includes(",")) {
      return { in: value.split(",").map((v) => this.parseFilterValue(v)) };
    }

    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
      return Number(value);
    }

    return value;
  }
}
