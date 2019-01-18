const mongoose = require('mongoose');

module.exports = async callback => {
    const url = 'mongodb://localhost:27017';
    await mongoose.connect(url, {
        useNewUrlParser: true,
        dbName: 'nodecomplete'
    });
    return callback();
};

// OBS: a dbName pode ser especificada na url, como exemplo: 'mongodb://localhost:27017/nodecomplete'