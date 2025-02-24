const Reviews = require('./../models/reviewModel');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Reviews);
exports.setTourUserIDs = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;  // getting id from protect middleware
    next();
}
exports.getReview = factory.getOne(Reviews);
exports.createReview = factory.createOne(Reviews);
exports.updateReview = factory.updateOne(Reviews);
exports.deleteReview = factory.deleteOne(Reviews);