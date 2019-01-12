const mongodb = require('mongodb');
const { ObjectId } = mongodb;
const { getDataBase } = require('../../database/connection');
const db = getDataBase;

module.exports = class User {
    constructor({ username, email, password, _id, cart }) {
        this.username = username;
        this.email = email;
        this.password = password;
        this._id = _id;
        this.cart = cart;
        if (!Array.isArray(cart.items))
            this.cart = { items: [] };
    }

    async save() {
        try {
            if (this._id) {
                return await db().collection('users')
                    .updateOne({ _id: new ObjectId(userId) }, {
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
            console.log(items);
            const productsIds = items.map(item => item.productId);
            const products = await db().collection('products').find({ _id: { $in: productsIds } }).toArray();
            return products.map(product => {
                const { quantity } = items.find(item => {
                    return item.productId.toString() === product._id.toString();
                });
                return { ...product, quantity: quantity };
            });
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
}

// save() {
//     if (this._id) {
//         return db().collection('users')
//             .updateOne({ _id: new ObjectId(userId) }, {
//                 $set: {
//                     username: this.username,
//                     email: this.email,
//                     password: this.password,
//                     cart: this.cart
//                 }
//             })
//             .then(() => {
//                 console.log('user update success!');
//                 return 'success';
//             })
//             .catch(e => console.log(e));
//     } else {
//         return db().collection('users')
//             .insertOne(this)
//             .then(() => {
//                 console.log('user created!');
//                 return 'success';
//             })
//             .catch(e => console.log(e));
//     }
// }

// static findUserById(userId) {
//     return db().collection('users')
//         .find({ _id: new ObjectId(userId) })
//         .next()
//         .then(user => {
//             // console.log(user);
//             if (user)
//                 return user;
//             return null;
//         })
//         .catch(e => console.log(e));
// }

// addProductToCart(productId) {
//     console.log(this.cart.items);
//     const updateCartItems = [...this.cart.items];
//     let newQuantity = 1;
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//         if (cp.productId === undefined) return -1;
//         return cp.productId.toString() === productId;
//     });
//     if (cartProductIndex >= 0) {
//         newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//         updateCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//         updateCartItems.push({ productId: new ObjectId(productId), quantity: newQuantity });
//     }
//     const updateCart = { items: updateCartItems };
//     return db().collection('users')
//         .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: updateCart } }
//         )
//         .then(() => {
//             return 'success';
//         })
//         .catch(e => console.log(e));
// }

// getCartProducts() {
//     return db().collection('users').find({ _id: new ObjectId(this._id) })
//         .next()
//         .then(user => {
//             if (user != undefined) {
//                 return user.cart.items;
//             }
//         })
//         .then(items => {
//             // console.log('items', items)
//             const productsIds = items.map(item => item.productId);
//             return db().collection('products').find({
//                 _id: { $in: productsIds }
//             })
//                 .toArray()
//                 .then(products => {
//                     // console.log('prod', products);
//                     return products.map(product => {
//                         const { quantity } = items.find(item => {
//                             return item.productId.toString() === product._id.toString();
//                         });
//                         // retornando um array de obj com dados do produto mais a quantidade
//                         return {
//                             ...product,
//                             quantity: quantity
//                         }
//                     })
//                 })
//         })
//         .catch(e => console.log(e));
// }

// removeProductFromCart(productId) {
//     const updateCartItems = [...this.cart.items];
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//         return cp.productId.toString() === productId;
//     });
//     if (cartProductIndex >= 0) {
//         updateCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity - 1;
//         let zeroQuantity = Boolean(updateCartItems[cartProductIndex].quantity === 0);
//         if (zeroQuantity) updateCartItems.splice(cartProductIndex, 1);
//     }
//     const updateCart = { items: updateCartItems };
//     return db().collection('users')
//         .updateOne(
//             { _id: new ObjectId(this._id) }, 
//             { $set: { cart: updateCart } }
//         )
//         .then(() => {
//             return 'success';
//         })
//         .catch(e => console.log(e));
// }
// }