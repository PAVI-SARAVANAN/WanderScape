class APIFeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filter(){
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach(el=> delete queryObj[el])
        //console.log(req.query);

        //ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) //regex for finding {gte/gt/lt/lte} \b = exact match g = get all occurences
        
        //let query = Tours.find(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('name');
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);   //INCLUSION
        }else{
            //this.query = this.query.select('-_id');  // - denotes EXCLUSION
        }
        return this;
    }
    pagination(){
        // 1-10 results in page 1,.., 21-30 in page 3
        const page = this.queryString.page * 1 || 1; // conv str to number,then default = 1
        const limit = this.queryString.limit * 1 || 50;  //conv str to number, default = 2
        const skip = (page - 1) * limit;       
        
        this.query = this.query.skip(skip).limit(limit);
        
        return this;
    }
}

module.exports = APIFeatures;