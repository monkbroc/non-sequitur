var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var url = process.env.MONGO_URL || 'mongodb://localhost/non-sequitur';
mongoose.connect(url);

