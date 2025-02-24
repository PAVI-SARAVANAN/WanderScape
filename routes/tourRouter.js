const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRouter');

const router = express.Router();

//router.param('id', tourController.checkID);
router
.route('/tour-statistics').get(tourController.getTourStats)

router
.route('/getMonthlyPlan/:year').get(
    authController.protect,
    authController.restrictTo('admin', 'lead-tour-guide','tour-guide'),
    tourController.getMonthlyPlan)

router
.route('/top-5-cheapest').get(tourController.aliasTopTours, tourController.getAllTours)

router
.route('/tours-within/:distance/center/:latlang/unit/:unit').get(tourController.getToursWithin)

router.route('/distance/:latlang/:unit').get(tourController.getDistances)

router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect, authController.restrictTo('tour-guide', 'lead-tour-guide', 'admin'), tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-tour-guide'),
    tourController.updateTour)
.delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-tour-guide'),
    tourController.deleteTour
)

router.use('/:tourId/reviews', reviewRouter);
/*router
.route('/:tourId/reviews')
.post(authController.protect, 
      authController.restrictTo('user'),
      reviewController.createReview
    )
*/

module.exports = router;