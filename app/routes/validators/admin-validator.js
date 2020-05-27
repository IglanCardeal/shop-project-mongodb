/**
 * Validacao das rotas de administracao.
 */

exports.addAndEditProductValidator = body => [
  body('price', 'Invalid price format! Try again.')
    .isFloat({
      locale: 'en-US',
    })
    .custom((value, { req }) => {
      if (Number(value) <= 1.0) {
        throw new Error(
          'The minimun price can not be less than 1.00! Try again'
        );
      }
      return true;
    }),

  body(
    'title',
    'Invalid product title! The length of title must be between 2 and 256 characters.'
  )
    .isString()
    .isLength({ min: 2, max: 256 })
    .trim(),
  // body("imageUrl", "Invalid URL address! Try again.")
  //   .isURL({
  //     // Apenas URL's externas para protocolos http e https.
  //     protocol: ["http", "https"]
  //   })
  //   .trim(),

  body(
    'description',
    'The description can not be greate than 1000 characters or less than 1 character.'
  )
    .isLength({
      min: 1,
      max: 1000,
    })
    .trim(),
];
