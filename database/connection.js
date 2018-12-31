const mongodb = require('mongodb');
const { MongoClient } = mongodb;

const url = 'mongodb://localhost:27017';
let _db = null;

exports.dataBaseConnection = callback => {
  MongoClient.connect(url, { useNewUrlParser: true })
    .then(client => {
      _db = client.db('nodecomplete'); // defini a db a ser usada
      console.log(_db.databaseName);
      callback();
    })
    .catch(e => console.log(e));
};

exports.getDataBase = () => {
  if (_db)
    return _db; // retorna a db para ser manipulada

  throw 'Unable to connect database!';
}