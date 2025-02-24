
const mongoose = require('mongoose');
const Tours = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync'); 
const appError = require('./../utils/appError');
const factory = require('./handlerFactory'); 

exports.aliasTopTours = (req,res,next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration, ratingsAverage, difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tours);
exports.getTour = factory.getOne(Tours, { path: 'Reviews'});
exports.updateTour = factory.updateOne(Tours);

exports.createTour = factory.createOne(Tours);
exports.deleteTour = factory.deleteOne(Tours);

exports.getTourStats = catchAsync(async(req, res, next) => {
   
        const stats = await Tours.aggregate([
            {
                $match:{ratingsAverage : { $gte:4.5}}
            },
            {
                $group:{
                    _id:{$toUpper: '$difficulty'},
                    numTours: {$sum: 1}, //for each doc pass thr this pipeline, it increments by +1
                    numRatings: {$sum: '$ratingsQuantity'}, //find the no.of ratings
                    avgRating:{$avg: '$ratingsAverage'}, //finding the avg for the values in ratingsaverage
                    avgPrice :{$avg: '$price'}, //finding the avg price
                    minPrice: {$min: '$price'}, //finding the min of all prices
                    maxPrice: {$max: '$price'} //finding the max of all prices
                }
            },
            {
                $sort:{ avgPrice: 1} //1 for ascending - sorting the pipeline result 
            }
        ])
        res.status(200).json({
            status:'success',
            data: stats
        });
});
exports.getMonthlyPlan = catchAsync(async(req, res, next) => {    
        const year = req.params.year * 1;
        const plan = await Tours.aggregate([
            {
                $unwind: '$startDates'
              },
              {
                $match: {
                  startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                  }
                }
              },
              {
                $group: {
                  _id: { $month: '$startDates' },
                  numTourStarts: { $sum: 1 },
                  tours: { $push: '$name' }
                }
              },
              {
                $addFields: { month: '$_id' }
              },
              {
                $project: {
                  _id: 0
                }
              },
              {
                $sort: { numTourStarts: -1 }
              },
              {
                $limit: 12
              }
        ]);
        res.status(200).json({
            status:'success',
            data: plan
        });
});

exports.getToursWithin = catchAsync(async(req, res, next) =>{
  const {distance, latlang, unit} = req.params;
  const [lat,lang] = latlang.split(',');
  const radius = unit ==='mi'? distance/3963.2 : distance/6378.1;

  if(!lat || !lang){
    next(new appError('Please provide latitude and longitude in the format: lat,lang', 400));
  }

  const tours = await Tours.find(
    {startLocation:{$geoWithin: {$centerSphere: [[lang, lat], radius]}}}
  );
  res.status(200).json({
    status:'success',
    result: tours.length,
    data: tours
  })

});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlang, unit } = req.params;
  const [lat, lang] = latlang.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lang) {
    next(
      new appError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lang * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});


