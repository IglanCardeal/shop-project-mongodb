/* eslint-disable no-underscore-dangle */
const PDFDocumentation = require('pdfkit');
const { createWriteStream } = require('fs');
const path = require('path');

const Product = require('../models/product');
const Order = require('../models/order');

// const STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY;
// const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

const { catchServerErrorFunction } = require('./error-controller');

const paginationFunction = require('../utils/pagination-function');

const ITEMS_PER_PAGE = 6;

// const getDataFromCart = products => {
//   // remover este codigo e deixar o controle do carrinho para o servidor.
//   const productsData = [];
//   const idsArray = [];
//   let totalPrice = 0;

//   products.forEach(order => {
//     totalPrice += order.quantity * order.productId.price;
//     idsArray.push(order.productId._id);
//     productsData.push({
//       data: order.productId,
//       quantity: order.quantity,
//     });
//   });

//   return {
//     idsArray,
//     productsData,
//     totalPrice,
//   };
// };

exports.getIndex = async (req, res, next) => {
  try {
    const page = Math.floor(+req.query.page) || 1; // evita que numeros float ou string sejam atribuidas ao page.

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE) // quantidade de n primeiros items a ignorar na consulta.
      .limit(ITEMS_PER_PAGE) // limite de retorno da query.
      .select('-userId') // ignora o id do usuario.
      .exec();

    const paginationObject = await paginationFunction(
      page,
      Product,
      ITEMS_PER_PAGE
    );

    return res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      isAuthenticated: req.session.isLoggedIn,
      ...paginationObject,
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to list products!',
      false,
      next
    );
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.floor(+req.query.page) || 1;

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select('-userId')
      .exec();

    const paginationObject = await paginationFunction(
      page,
      Product,
      ITEMS_PER_PAGE
    );

    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      isAuthenticated: req.session.isLoggedIn,
      ...paginationObject,
    });
  } catch (error) {
    catchServerErrorFunction(
      error,
      500,
      'Unable to list products!',
      false,
      next
    );
  }
};

exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId)
      .select('-userId')
      .exec();

    return res.render('shop/product-detail', {
      product,
      pageTitle: product.title,
      path: '/products',
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to get the product!',
      false,
      next
    );
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();

    const products = user.cart.items.map(item => {
      return { ...item.productId._doc, quantity: item.quantity };
    });

    return res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: [...products, ...products, ...products]
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to get the products in cart!',
      true,
      next
    );
  }
};

// exports.getCart = async (req, res, next) => {
//   try {
//     const user = await req.user.populate('cart.items.productId').execPopulate();

//     const products = user.cart.items;

//     return res.send(JSON.stringify(jsonData));
//   } catch (error) {
//     return catchServerErrorFunction(
//       error,
//       500,
//       'Unable to get the products in cart!',
//       true,
//       next
//     );
//   }
// };

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;

  try {
    await req.user.addProductToCart(productId);

    return res.redirect('/cart');
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to add a product to cart!',
      false,
      next
    );
  }
};

exports.postCartControlQuantity = async (req, res, next) => {
  try {
    // remover este codigo e deixar o controle do carrinho para o servidor.
    const { action, productId } = req.body;

    if (action === 'increase' || action === 'decrease') {
      await req.user.addProductToCart(productId, action);
    }

    if (action === 'delete') {
      await req.user.removeProductFromCart(productId);
    }

    return res.status(200).json();
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to control the products in cart!',
      true,
      next
    );
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    await req.user.removeProductFromCart(req.body.productId);

    res.redirect('/cart');
  } catch (error) {
    catchServerErrorFunction(
      error,
      500,
      'Unable to delete the product from cart!',
      false,
      next
    );
  }
};

/**
 ========== Dois metodos usados para pagamento com a API @Stripe ==========
exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    let total = 0;
    products.forEach(prod => {
      total += prod.quantity * prod.productId.price;
    });
    const line_items = products.map(p => {
      return {
        name: p.productId.title,
        description: p.productId.description,
        amount: p.productId.price * 100, // valor em centavos.
        currency: "usd",
        quantity: p.quantity
      };
    });
    stripe.checkout.sessions.create(
      {
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        payment_method_types: ["card"],
        line_items: line_items,
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`
      },
      function(error, session) {
        if (error) throw error;
        return res.render("shop/checkout", {
          path: "/checkout",
          pageTitle: "Checkout",
          products: products,
          totalSum: total,
          isAuthenticated: req.session.isLoggedIn,
          sessionId: session.id
        });
      }
    );
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      "Unable to process your payment! Try again later.",
      false,
      next
    );
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
  const getProductsToOrder = user => {
    let totalPrice = 0;
    let cartProducts = user.cart.items.map(item => {
      totalPrice += item.productId._doc.price * item.quantity;
      return {
        // '._doc' extrai todos os dados do documento relacionado.
        product: { ...item.productId._doc },
        quantity: item.quantity
      };
    });
    return { cartProducts, totalPrice };
  };
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id
      },
      totalPrice: getProductsToOrder(user).totalPrice,
      products: getProductsToOrder(user).cartProducts
    });
    await order.save();
    await req.user.clearCart();
    return res.redirect("/orders");
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      "Unable to add new orders!",
      false,
      next
    );
  }
};
 */

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();

    const products = user.cart.items;

    let total = 0;

    products.forEach(prod => {
      total += prod.quantity * prod.productId.price;
    });

    return res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products,
      totalSum: total,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to process your payment! Try again later.',
      false,
      next
    );
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userOrders = await Order.find({
      'user.userId': req.user._id,
    }).exec();

    return res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: userOrders,
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to get orders!',
      false,
      next
    );
  }
};

exports.postOrder = async (req, res, next) => {
  const getProductsToOrder = user => {
    let totalPrice = 0;

    const cartProducts = user.cart.items.map(item => {
      totalPrice += item.productId._doc.price * item.quantity;
      return {
        // '._doc' extrai todos os dados do documento relacionado.
        product: { ...item.productId._doc },
        quantity: item.quantity,
      };
    });

    return { cartProducts, totalPrice };
  };

  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id,
      },
      totalPrice: getProductsToOrder(user).totalPrice,
      products: getProductsToOrder(user).cartProducts,
    });

    await order.save();

    await req.user.clearCart();

    return res.redirect('/orders');
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to add new orders!',
      false,
      next
    );
  }
};

// eslint-disable-next-line consistent-return
exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: userId } = req.user;

  const invoiceFileName = `invoice-${orderId}.pdf`;

  const currentYear = new Date().getFullYear().toString();

  const invoicePath = path.join(
    'app',
    'public',
    'invoices',
    currentYear,
    invoiceFileName
  );

  try {
    const order = await Order.findById(orderId).exec();

    if (!order) {
      return catchServerErrorFunction(
        new Error('No orders here!'),
        404,
        'No order related to user found!',
        false,
        next
      );
    }

    const orderBelongsToUser = Boolean(
      order.user.userId.toString() === userId.toString()
    );

    if (!orderBelongsToUser) {
      return catchServerErrorFunction(
        new Error('Unauthorized action!'),
        401,
        'Unauthorized request denied!',
        false,
        next
      );
    }

    // gerando arquivos pdf.
    const pdfDoc = new PDFDocumentation();

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    pdfDoc.pipe(createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    res.setHeader('Content-Type', 'application/pdf'); // permite o browser identificar o tipo de arquivo.
    res.setHeader(
      // deifni como sera exibido pelo browser. Realiza download do arquivo.
      'Content-Disposition',
      `attachement; filename="${invoiceFileName}"`
    );

    pdfDoc.fontSize(28).text('INVOICE', { align: 'center' });
    pdfDoc.text(` ------- Orders from ${req.user.username} ------- `, {
      align: 'center',
    });

    let totalprice = 0;

    order.products.forEach(prod => {
      totalprice += prod.quantity * prod.product.price;
      pdfDoc.text(
        `
      ${prod.product.title} - ${prod.quantity} x $${prod.product.price}
      `,
        {
          align: 'left',
        }
      );
    });

    pdfDoc.text(`Total Price: $${totalprice}`, { align: 'center' });
    pdfDoc.end();
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to generate the invoice file!',
      false,
      next
    );
  }
};
