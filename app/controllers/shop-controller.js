/**
 * @productsshow
 * Controller para exibicao de produtos, detalhes de produtos, carrinhos de compras
 *  e ordem de compra.
 * @catchServerErrorFunction funcao que executa tratamento de erros.
 */

const Product = require("../models/product");
const Order = require("../models/order");

const fs = require("fs");
const path = require("path");

const PDFDocumentation = require("pdfkit");

/**
 * catchServerErrorFunction recebe:
 * objeto de error.
 * httpStatusCode.
 * msg de erro, verificacao se chamada e um ajax.
 * next.
 * catchServerErrorFunction( @object , @number , @string , @boolean , @next )
 */
const { catchServerErrorFunction } = require("./error-controller");

const paginationFunction = require("../utils/pagination-function");
const ITEMS_PER_PAGE = 3;

exports.getIndex = async (req, res, next) => {
  try {
    let page = Math.floor(+req.query.page) || 1; // evita que numeros float ou string sejam atribuidas ao page.
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE) // quantidade de n primeiros items a ignorar na consulta.
      .limit(ITEMS_PER_PAGE) // limite de retorno da query.
      .select("-userId") // ignora o id do usuario.
      .exec();
    const paginationObject = await paginationFunction(
      page,
      Product,
      ITEMS_PER_PAGE
    );
    return res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      isAuthenticated: req.session.isLoggedIn,
      ...paginationObject
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to list products!",
      false,
      next
    );
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    let page = Math.floor(+req.query.page) || 1;
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("-userId")
      .exec();
    const paginationObject = await paginationFunction(
      page,
      Product,
      ITEMS_PER_PAGE
    );
    return res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      isAuthenticated: req.session.isLoggedIn,
      ...paginationObject
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to list products!",
      false,
      next
    );
  }
};

exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId)
      .select("-userId")
      .exec();
    return res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get the product!",
      false,
      next
    );
  }
};

exports.getCart = (req, res, next) => {
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart"
  });
};

exports.ajaxGetCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    const jsonData = getDataFromCart(products);
    return res.send(JSON.stringify(jsonData));
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get the products in cart!",
      true,
      next
    );
  }
};

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await req.user.addProductToCart(productId);
    return res.redirect("/cart");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to add a product to cart!",
      false,
      next
    );
  }
};

exports.postCartControlQuantity = async (req, res, next) => {
  try {
    const { action, productId } = req.body;
    if (action === "increase" || action === "decrease") {
      await req.user.addProductToCart(productId, action);
    }
    if (action === "delete") {
      await req.user.removeProductFromCart(productId);
    }
    return res.status(200).json();
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to control the products in cart!",
      true,
      next
    );
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    await req.user.removeProductFromCart(req.body.productId);
    return res.redirect("/cart");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to delete the product from cart!",
      false,
      next
    );
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userOrders = await Order.find({
      "user.userId": req.user._id
    }).exec();
    return res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: userOrders
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get orders!",
      false,
      next
    );
  }
};

exports.postOrder = async (req, res, next) => {
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
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to add new orders!",
      false,
      next
    );
  }
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user._id;
  const invoiceFileName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("app", "public", "invoices", invoiceFileName);
  try {
    const order = await Order.findById(orderId).exec();
    if (!order) {
      return catchServerErrorFunction(
        error,
        404,
        "No order related to user found!",
        false,
        next
      );
    }
    const orderBelongsToUser = Boolean(
      order.user.userId.toString() === userId.toString()
    );
    if (!orderBelongsToUser) {
      return catchServerErrorFunction(
        error,
        401,
        "Unauthorized request denied!",
        false,
        next
      );
    }
    // gerando arquivos pdf.
    const pdfDoc = new PDFDocumentation();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    res.setHeader("Content-Type", "application/pdf"); // permite o browser identificar o tipo de arquivo.
    res.setHeader(
      // deifni como sera exibido pelo browser. Realiza download do arquivo.
      "Content-Disposition",
      'attachement; filename="' + invoiceFileName + '"'
    );
    pdfDoc.fontSize(28).text("INVOICE", { align: "center" });
    pdfDoc.text(` ------- Orders from ${req.user.username} ------- `, {
      align: "center"
    });
    let totalprice = 0;
    order.products.forEach(prod => {
      totalprice += prod.quantity * prod.product.price;
      pdfDoc.text(
        `
      ${prod.product.title} - ${prod.quantity} x $${prod.product.price}
      `,
        {
          align: "left"
        }
      );
    });
    pdfDoc.text(`Total Price: $${totalprice}`, { align: "center" });
    pdfDoc.end();
    // const data = await readFileAsync(invoicePath); // envio de arquivos pequenos.
    // const file = fs.createReadStream(invoicePath); // streaming de arquivos grandes.
    // res.setHeader("Content-Type", "application/pdf"); // permite o browser identificar o tipo de arquivo.
    // res.setHeader(
    //   // deifni como sera exibido pelo browser. Realiza download do arquivo.
    //   "Content-Disposition",
    //   'attachement; filename="' + invoiceFileName + '"'
    // );
    // return res.send(data);
    // file.pipe(res); // envia cada pacote de stream na resposta.
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to generate the invoice file!",
      false,
      next
    );
  }
};

const getDataFromCart = products => {
  const productsData = [];
  const idsArray = [];
  let totalPrice = 0;
  products.forEach(order => {
    totalPrice += order.quantity * order.productId.price;
    idsArray.push(order.productId._id);
    productsData.push({
      data: order.productId,
      quantity: order.quantity
    });
  });
  return {
    idsArray: idsArray,
    productsData: productsData,
    totalPrice: totalPrice
  };
};

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

const readFileAsync = async invoicePath => {
  return await new Promise((resolve, reject) => {
    fs.readFile(invoicePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
