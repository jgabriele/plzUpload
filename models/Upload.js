
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema({
	ip: String,
	ext: String,
	code: String,
	name: String,
	userId: String,
	date: Date
});

var Upload = mongoose.model('Uploads', UploadSchema);

module.exports = Upload;
