module.exports = async (page, Product, ITEMS_PER_PAGE, userId = null) => {
  // Se for paginar uma lista de produtos de usuario, filtramos a contagem passando o id de usuario. Caso contrario,
  // passamos um objeto vazio para contar todos os documentos da collection.
  const onlyCountUserProduct = userId ? { userId } : {};

  const totalItems = await Product.find(onlyCountUserProduct).countDocuments();

  return {
    currentPage: page,
    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(+totalItems / +ITEMS_PER_PAGE),
  };
};
