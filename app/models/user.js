const mongodb = require('mongodb');
const { ObjectId } = mongodb;
const { getDataBase } = require('../../database/connection');
const db = getDataBase;

module.exports = class User {
  constructor({ username, email, password, userId }) {
    this.username = username;
    this.email = email;
    this.password = password;
    this._id = userId;
  }

  save() {
    if (this._id) {
      return db().collection('users')
        .updateOne({ _id: new ObjectId(userId) }, {
          $set: {
            username: this.username,
            email: this.email,
            password: this.password
          }
        })
        .then(() => {
          console.log('user update success!');
          return 'success';
        })
        .catch(e => console.log(e));
    }
    else {
      return db().collection('users')
        .insertOne(this)
        .then(() => {
          console.log('user created!');
          return 'success';
        })
        .catch(e => console.log(e));
    }
  }

  static findUserById(userId) {
    return db().collection('users')
      .find({ _id: new ObjectId(userId) })
      .next()
      .then(user => {
        // console.log(user);
        if (user)
          return user;
        return null;
      })
      .catch(e => console.log(e));
  }
}