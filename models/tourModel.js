const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const slug = require('slugify');
//const User = require('./userModel')

const toursSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'A tour must have a name'],
        unique:true,
        trim:true,
        maxlength: [40, 'A tour name must have 40 characters or less'],
        minlength:[10, 'A tour name must have atleast 10 characters']
    },
    duration:{
        type:Number,
        required: [true, 'A tour must have a duration']
    },
    slug:{
        type: String
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true, 'A tour must have a difficulty level'],
        enum:{
            values:['easy','medium', 'difficult'],
            message:'The value of difficulty field can be easy, medium or difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4,
        set: val => Math.round(val * 10 ) /10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number
    },
    priceDiscount:{
        type:Number,
        type: Number,
        validate: {
          validator: function(val) {
            return val < this.price; // if price = 100, discountPrice = 150, it returns false
          },
          message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true,
        required:[true, 'A tour must have a description']
    },
    imageCover:{
        type:String,
        required:[true, 'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type: Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTours:{
        type:Boolean,
        default:false
    },
    startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
    locations:[
        {
        type:{
                type: String,
                default: 'Point',
                enum:['Point']
            },           
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
        }        
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'users'
        }
    ]
    
},    
    {
        toJSON: {virtuals:true},
        toObject:{virtuals:true}
    }
   
);
toursSchema.index({startLocation: "2dsphere"});
toursSchema.index({price: 1, ratingsAverage: -1});
toursSchema.index({slug: 1});



toursSchema.virtual('durationInWeeks').get(function (){
    return this.duration / 7;  // creating virtual properties 
});
// virtual populate
toursSchema.virtual('Reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});
// document middleware
/*
toursSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next();
});*/

/*toursSchema.pre('save', async function(next){
    const tourGuidesPromises = this.guides.map(async id => User.findById(id));
    this.guides = await Promise.all(tourGuidesPromises);
    next();
}) */
// query middleware - runs before find functions

toursSchema.pre(/^find/, function(next){
    this.find({secretTours: {$ne: true}})
    this.start = Date.now();
    next();
}); 
toursSchema.pre(/^find/, function(next){
    this.populate({
        path:'guides',
        select: '-__v -_id'
    
    });
    next();
}) 
toursSchema.post(/^find/, function(docs, next){
    //console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
})

//Aggregation middleware
/*
toursSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    //console.log(this.pipeline());
    next();   
}); */


const Tours = mongoose.model('Tours', toursSchema);

module.exports = Tours;