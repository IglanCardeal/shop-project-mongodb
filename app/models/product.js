const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // referencia ao model User
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema); // mongoose ira criar a collection 'products' - lowercase e plural


// const mongodb = require('mongodb');
// const { ObjectId } = mongodb;
// const { getDataBase } = require('../../database/connection');
// const db = getDataBase;


// module.exports = class Product {
//     constructor({ title, price, description, imageUrl, productId }, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = productId;
//         this.userId = userId;
//     }

//     async save() {
//         try {
//             if (this._id && this.userId) {
//                 return await db().collection('products').updateOne({
//                     _id: new ObjectId(this._id),
//                     userId: new ObjectId(this.userId)
//                 }, {
//                         $set: {
//                             title: this.title,
//                             price: this.price,
//                             description: this.description,
//                             imageUrl: this.imageUrl
//                         }
//                     });
//             } else {
//                 return await db().collection('products').insertOne(this);
//             }
//         } catch (error) {
//             console.log('Error: ', error);
//             return 'failed';
//         }

//     }

//     static async fetchAllProducts(userId) {
//         try {
//             if (!userId) {
//                 return await db().collection('products')
//                     .find().toArray();
//             }
//             return await db().collection('products')
//                 .find({ userId: new ObjectId(userId) })
//                 .toArray();
//         } catch (error) {
//             console.log('Error:', error);
//             return 'failed';
//         }

//     }

//     static async findProductById(productId, userId) {
//         try {
//             if (!userId) {
//                 return await db().collection('products')
//                     .find({ _id: new ObjectId(productId) })
//                     .next();
//             }
//             return await db().collection('products')
//                 .find({ _id: new ObjectId(productId), userId: new ObjectId(userId) })
//                 .next();
//         } catch (error) {
//             console.log('Error:', error);
//             return 'failed';
//         }
//     }

//     static async deleteProductById(productId, userId) {
//         try {
//             return await db().collection('products')
//                 .deleteOne({ _id: new ObjectId(productId), userId: new ObjectId(userId) });
//         } catch (error) {
//             console.log('Error:', error);
//             return 'failed';
//         }
//     }
// }

// /*
//   ObjectId - provido pelo mongodb para gerar um dado id unico em um objeto para cada documento caso seja omitido uma especificacao. Logo o _id e um objeto e nao uma string.
//     ref: https://docs.mongodb.com/manual/reference/bson-types/#objectid
// */