const mongodb = require('mongodb');
const { ObjectId } = mongodb;
const { getDataBase } = require('../../database/connection');
const db = getDataBase;


module.exports = class Product {
    constructor({ title, price, description, imageUrl, productId }, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = productId;
        this.userId = userId;
    }

    async save() {
        try {
            if (this._id && this.userId) {
                return await db().collection('products').updateOne({
                    _id: new ObjectId(this._id),
                    userId: new ObjectId(userId)
                }, {
                        $set: {
                            title: this.title,
                            price: this.price,
                            description: this.description,
                            imageUrl: this.imageUrl
                        }
                    });
            } else {
                return await db().collection('products').insertOne(this);
            }
        } catch (error) {
            console.log('Error: ', error);
            return 'failed';
        }

    }

    static async fetchAllProducts(userId) {
        try {
            if (!userId) {
                return await db().collection('products')
                    .find().toArray();
            }
            return await db().collection('products')
                .find({ userId: new ObjectId(userId) })
                .toArray();
        } catch (error) {
            console.log('Error:', error);
            return 'failed';
        }

    }

    static async findProductById(productId, userId) {
        try {
            if (!userId) {
                return await db().collection('products')
                    .find({ _id: new ObjectId(productId) })
                    .next();
            }
            return await db().collection('products')
                .find({ _id: new ObjectId(productId), userId: new ObjectId(userId) })
                .next();
        } catch (error) {
            console.log('Error:', error);
            return 'failed';
        }
    }

    static async deleteProductById(productId, userId) {
        try {
            return await db().collection('products')
                .deleteOne({ _id: new ObjectId(productId), userId: new ObjectId(userId) });
        } catch (error) {
            console.log('Error:', error);
            return 'failed';
        }
    }
}

/*
  ObjectId - provido pelo mongodb para gerar um dado id unico em um objeto para cada documento caso seja omitido uma especificacao. Logo o _id e um objeto e nao uma string.
    ref: https://docs.mongodb.com/manual/reference/bson-types/#objectid
*/


// class Products {
//     // before
//     static fetchAllProducts(userId) {
//         return db().collection('products')
//             .find({ userId: new ObjectId(userId) })
//             .toArray()
//             .then(products => {
//                 return products;
//             })
//             .catch(e => console.log(e));
//     }
//     // now with async/await
//     static async fetchAllProductsAsync(userId) {
//         const products = await db().collection('products')
//             .find({ userId: new ObjectId(userId) })
//             .toArray();
//         return products;
//     }
// }

// save() {
//     if (this._id && this.userId) {
//         return await db().collection('products')
//             .updateOne({
//                 _id: new ObjectId(this._id),
//                 userId: new ObjectId(userId)
//             }, {
//                     $set: {
//                         title: this.title,
//                         price: this.price,
//                         description: this.description,
//                         imageUrl: this.imageUrl
//                     }
//                 })
//             .then(() => {
//                 // console.log('updated book!');
//                 return 'success';
//             })
//             .catch(e => console.log(e));
//     }
//     else {
//         return db().collection('products')
//             .insertOne(this)
//             .then(() => {
//                 // console.log('product inserted');
//             })
//             .catch(e => console.log(e));
//     }
// }

// static findProductById(productId, userId) {
//     if (!userId) {
//         return db().collection('products')
//             .find({ _id: new ObjectId(productId) })
//             .next()
//             .then(product => product)
//             .catch(e => console.log(e));
//     }
//     return db().collection('products')
//         .find({ _id: new ObjectId(productId), userId: new ObjectId(userId) })
//         .next()
//         .then(product => {
//             // console.log(product)
//             // console.log('query success!');
//             return product;
//         })
//         .catch(e => console.log(e));
// }

// static deleteProductById(productId, userId) {
//     return db().collection('products')
//         .deleteOne({ _id: new ObjectId(productId), userId: new ObjectId(userId) })
//         .then(() => {
//             // console.log('removed with success!');
//             return true;
//         })
//         .catch(e => console.log(e));
// }