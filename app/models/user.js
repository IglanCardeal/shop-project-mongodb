const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId, // guarda um ObjectId referencia de a products
                    required: true,
                    ref: 'Product' // referencia ao model Product, o que indica para o mongoose que quando usarmos .populate(), ele ira fazer um busca 
                                  // na collection products e trazer os dados relativos ao documento com este id.
                },
                quantity: { 
                    type: Number, 
                    required: true 
                }
            }
        ]
    }
});

userSchema.methods.addProductToCart = async function (productId) { // methos permite criar funcoes personalizadas para o model User
    const updateCartItems = [...this.cart.items]; // this refere ao schema user pois se usa function
    const cartProductIndex = this.cart.items.findIndex(cp => {
        if (cp.productId === undefined) return -1;
        return cp.productId.toString() === productId;
    });
    
    if (cartProductIndex >= 0) updateCartItems[cartProductIndex].quantity++; // caso ja exista, apenas incrementa
    else updateCartItems.push({ productId: productId, quantity: 1 }); // se nao existe, adiciona 
    
    const updateCart = { items: updateCartItems };
    this.cart = updateCart;
    try {
        await this.save();
        return ;
    } catch (error) {
        console.log('=> Error on model: ', error);
        return new Error('Unable to add a product to cart on addProductToCart() method!');
    }
};

// implementar um metodo que decrementa em um cada item do carro e criar o botao na view.
userSchema.methods.removeProductFromCart = async function (productId) {
    const updateCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updateCartItems;
    await this.save();
    return ;
};

userSchema.methods.clearCart = async function () {
    this.cart.items = [];
    await this.save();
    return ;
};

module.exports = mongoose.model('User', userSchema);