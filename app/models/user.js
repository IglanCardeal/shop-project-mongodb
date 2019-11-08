const mongoose = require("mongoose");
const { Schema } = mongoose;

// *************************************************************
// Model de usuarios.
// Contem os seguintes metodos personalizados:
//  - addProductToCart()
//  - removeProductToCart()
//  - clearCart()
// *************************************************************

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    select: false,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId, // guarda um ObjectId referencia a products
          required: true,
          ref: "Product"
          // referencia ao model Product, o que indica para o mongoose que quando usarmos .populate(), ele ira fazer um busca
          // na collection products e trazer os dados relativos ao documento com este id.
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  },
  resetToken: {
    type: String,
    required: false,
    default: ""
  },
  tokenExpiration: {
    type: Date,
    required: false
  }
});

// Adiciona Product ao Cart e controla a quantidade de products no cart.
userSchema.methods.addProductToCart = async function(productId, action = null) {
  // this refere ao schema user pois se usa funcoes normais.
  const updateCartItems = [...this.cart.items];
  const cartProductIndex = this.cart.items.findIndex(cp => {
    if (cp.productId === undefined) return -1;
    return cp.productId.toString() === productId;
  });
  const doIncrease = Boolean(
    cartProductIndex >= 0 && (action === null || action === "increase")
  );
  const doDecrease = Boolean(cartProductIndex >= 0 && action === "decrease");

  if (doIncrease) updateCartItems[cartProductIndex].quantity++;
  if (doDecrease) {
    updateCartItems[cartProductIndex].quantity--;
    if (updateCartItems[cartProductIndex].quantity === 0)
      updateCartItems.splice(cartProductIndex, 1);
  }
  // se nao existe, adiciona
  if (cartProductIndex === -1)
    updateCartItems.push({ productId: productId, quantity: 1 });

  const updateCart = { items: updateCartItems };
  this.cart = updateCart;
  try {
    await this.save();
    return;
  } catch (error) {
    console.log("=> Error on model: ", error);
    return new Error(
      "Unable to add a product to cart on addProductToCart() method!"
    );
  }
};

// Remove Product do Cart
userSchema.methods.removeProductFromCart = async function(productId) {
  const updateCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updateCartItems;
  await this.save();
  return;
};

// Remove e limpa todos os Products do Cart
userSchema.methods.clearCart = async function() {
  this.cart.items = [];
  await this.save();
  return;
};

module.exports = mongoose.model("User", userSchema);
