var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var url = process.env.MONGODB_URL || 'mongodb://localhost/non-sequitur';
mongoose.connect(url);

