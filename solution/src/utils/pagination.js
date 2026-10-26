const parsePagination = (query) => {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    const isPositiveInt = /^[1-9]\d*$/.test(String(query.page).trim());
    if (!isPositiveInt) {
      return { error: "page and limit must be positive integers" };
    }
    page = parseInt(query.page, 10);
  }

  if (query.limit !== undefined) {
    const isPositiveInt = /^[1-9]\d*$/.test(String(query.limit).trim());
    if (!isPositiveInt) {
      return { error: "page and limit must be positive integers" };
    }
    const parsedLimit = parseInt(query.limit, 10);
    limit = parsedLimit > 50 ? 50 : parsedLimit;
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};

module.exports = {
  parsePagination,
  buildMeta,
};
