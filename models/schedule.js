
const { Model } = require('objection');

class schedule extends Model {
  
  static get tableName() {
    return 'schedule';
  }


  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
    //  required: ['username', 'password'],

      properties: {
        id: { type: 'integer' },
       
        theaterName: { type: 'string', minLength: 1, maxLength: 255 },
        screenName: { type: 'string', minLength: 1, maxLength: 255 },
        movieName: { type: 'string', minLength: 1, maxLength: 255 },
        movieDate: { type: 'string' },
        timeFrom:{type:'string'},
        timeTo:{type:'string'},
       // createdAt:{type: 'time'},
        //updatedAt:{type: 'time'}
       
      }
    };
  }
}

module.exports = schedule