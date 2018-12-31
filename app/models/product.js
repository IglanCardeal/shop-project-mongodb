const mongodb = require('mongodb');
const { ObjectId } = mongodb;
const { getDataBase } = require('../../database/connection');
const db = getDataBase;


module.exports = class Product {
  constructor({ title, price, description, imageUrl, productId }) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = productId;
  }

  save() {
    if (this._id) {
      return db().collection('products')
        .updateOne({ _id: new ObjectId(this._id) }, {
          $set: {
            title: this.title,
            price: this.price,
            description: this.description,
            imageUrl: this.imageUrl
          }
        })
        .then(() => {
          console.log('updated book!');
          return 'success';
        })
        .catch(e => console.log(e))
    }
    else {
      return db().collection('products')
        .insertOne(this)
        .then(() => {
          console.log('product inserted');
        })
        .catch(e => console.log(e));
    }
  }

  static fetchAllProducts() {
    return db().collection('products')
      .find()
      .toArray()
      .then(products => {
        return products;
      })
      .catch(e => console.log(e));
  }

  static findProductById(productId) {
    return db().collection('products')
      .find({ _id: new ObjectId(productId) })
      .next()
      .then(product => {
        // console.log(product)
        console.log('query success!');
        return product;
      })
      .catch(e => console.log(e));
  }

  static deleteProductById(productId) {
    return db().collection('products')
      .deleteOne({ _id: new ObjectId(productId) })
      .then(() => {
        console.log('removed with success!');
        return true;
      })
      .catch(e => console.log(e));
  }
}

/*
  ObjectId - provido pelo mongodb para gerar um dado id unico em um objeto para cada documento caso seja omitido uma especificacao. Logo o _id e um objeto e nao uma string.
    ref: https://docs.mongodb.com/manual/reference/bson-types/#objectid

*/