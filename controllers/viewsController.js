const Tours = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview =  catchAsync(async(req,res,next)=>{
    //Get All Tours
    const tours = await Tours.find();

    //Build Template

    //Render template with data
    res.status(200).render('overview', 
        {title:'All Tours',
         tours
        })
});

exports.getTours = catchAsync(async(req,res,next)=>{
    //Get the data
    const tour = await Tours.findOne({slug:req.params.slug}).populate({
        path:'Reviews',
        fields: 'review rating user'
    })
    //Build template
    
    //Render template with data
    res.status(200).render('tour', 
        {title:tour.name,
         tour
        })
});
exports.getLoginForm = catchAsync(async(req,res,next)=>{
    //Render template with data
    res.status(200).render('login', 
        {title:'Log into your account',
        
        })
});
