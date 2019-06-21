module.exports = async (page, Product, ITEMS_PER_PAGE) => {
  const totalItems = await Product.find()
    .countDocuments()
    .exec();
  return {
    currentPage: page,
    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
  };
};