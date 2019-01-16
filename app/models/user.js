const mongodb = require('mongodb');
const { ObjectId } = mongodb;
const { getDataBase } = require('../../database/connection');
const db = getDataBase;

module.exports = class User {
    constructor({ username, email, password, _id = null, cart = { items: [] } }) {
        this.username = username;
        this.email = email;
        this.password = password;
        this._id = _id;
        if (cart.items instanceof Array) {
            this.cart = cart;
        } else {
            this.cart = { items: [] };
        }
    }

    async save() {
        try {
            if (this._id) {
                return await db().collection('users')
                    .updateOne({ _id: new ObjectId(this._id) }, {
                        $set: {
                            username: this.username,
                            email: this.email,
                            password: this.password,
                            cart: this.cart
                        }
                    });
            } else {
                return await db().collection('users')
                    .insertOne(this);
            }
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }

    static async findUserById(userId) {
        try {
            return await db().collection('users')
                .find({ _id: new ObjectId(userId) })
                .next();
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }

    async addProductToCart(productId) {
        try {
            const updateCartItems = [...this.cart.items];
            let newQuantity = 1;
            const cartProductIndex = this.cart.items.findIndex(cp => {
                if (cp.productId === undefined) return -1;
                return cp.productId.toString() === productId;
            });
            if (cartProductIndex >= 0) {
                newQuantity = this.cart.items[cartProductIndex].quantity + 1;
                updateCartItems[cartProductIndex].quantity = newQuantity;
            } else {
                updateCartItems.push({ productId: new ObjectId(productId), quantity: newQuantity });
            }
            const updateCart = { items: updateCartItems };
            return await db().collection('users')
                .updateOne(
                    { _id: new ObjectId(this._id) },
                    { $set: { cart: updateCart } }
                );
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }

    async getCartProducts() {
        try {
            let user = await db().collection('users').find({ _id: new ObjectId(this._id) }).next();
            let items = user.cart.items;
            const productsIds = items.map(item => item.productId);
            const products = await db().collection('products').find({ _id: { $in: productsIds } }).toArray();
            let updateCartItems = [];
            const productsInCart = products.map(product => {
                const { quantity, productId } = items.find(item => {
                    return item.productId.toString() === product._id.toString();
                });
                updateCartItems.push({ productId: new ObjectId(productId), quantity });
                return { ...product, quantity: quantity };
            });
            // metodo para atualizar o cart com base nos dados recebidos de products,
            // caso algum produto tenha sido removido na collection products, tambem sera
            // removido da collection users.cart.
            await db().collection('users').updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: { items: updateCartItems } } }
            );
            // =====================================================================
            return productsInCart;
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }

    async removeProductFromCart(productId) {
        try {
            const updateCartItems = [...this.cart.items];
            const cartProductIndex = this.cart.items.findIndex(cp => {
                return cp.productId.toString() === productId;
            });
            if (cartProductIndex >= 0) {
                updateCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity - 1;
                let zeroQuantity = Boolean(updateCartItems[cartProductIndex].quantity === 0);
                // se a quantidade de product for zero, remove ele do cart
                if (zeroQuantity) updateCartItems.splice(cartProductIndex, 1);
            }
            const updateCart = { items: updateCartItems };
            return await db().collection('users')
                .updateOne(
                    { _id: new ObjectId(this._id) },
                    { $set: { cart: updateCart } }
                );
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }

    async addOrders() {
        try {
            const products = await this.getCartProducts();
            const orders = {
                items: products,
                user: {
                    userId: new ObjectId(this._id),
                    username: this.username
                }
            };
            const result = await db().collection('orders').insertOne(orders);
            if (result === 'failed')
                return 'failed';
            // metodo para esvaziar o cart depois de realizada a order.
            const cleanCart = { items: [] };
            return await db().collection('users').updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: cleanCart } }
            );
            // =====================================================
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }

    async getOrders() {
        try {
            return await db().collection('orders')
                .find({ 'user.userId': new ObjectId(this._id) })
                .toArray();
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }
    }
}