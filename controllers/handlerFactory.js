const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/apifeatures');

exports.deleteOne = Model => catchAsync(async(req, res, next)=> {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc){
        return next(new appError('No tour with this ID', 404));
    }

    res.status(200).json({
        status:'success',
        count: doc.length
    });    
}); 

exports.updateOne = Model => catchAsync(async(req, res, next)=> {    
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    });
    if (!doc){
        return next(new appError('No doc with this ID', 404));
    }

    res.status(200).json({
        status:'success',
        count: doc.length,
        data:{
            doc
        }
    });    
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
  
    const newDoc = await Model.create(req.body);
    res.status(201).json({
        status:'success',
        data:{
            data: newDoc
        }
    });   
});

exports.getOne = (Model, Populate) => catchAsync(async(req, res, next)=> {
    let query = Model.findById(req.params.id);
    if (Populate) query = query.populate(Populate);
    
    const doc = await query;
   
    //const doc = await Model.findById(req.params.id).populate({ path: 'Reviews' });
   //const tour = await Tours.findOne({ _id:req.params.id}).populate({ path: 'Reviews' });
   if (!doc){
       
       return next(new appError('No tour with this ID', 404))            
   }
   res.status(200).json({
       status:'success',
       count: doc.length,
       data:{
           doc
       }
   });       
 
});

exports.getAll = Model => catchAsync(async(req, res, next)=>{  
    //For nested Get reviews on Tour 
    let filter = {}
    if(req.params.tourId)  filter = {tour: req.params.tourId}    
        
    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
    const doc = await features.query;//.explain()
    res.status(200).json({
    status:'success',
    count: doc.length,
    data:{
        doc
    }
});        
});


