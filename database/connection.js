const mongodb = require('mongodb');
const { MongoClient } = mongodb;

const url = 'mongodb://localhost:27017';
let _db = null;

exports.dataBaseConnection = async callback => {
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        _db = client.db('nodecomplete');
        return callback();
    } catch (error) {
        console.log('Unable to connect database.\n----> Error: ', error);
        return ;
    }
};

exports.getDataBase = () => {
    return _db; // retorna a db para ser manipulada
}