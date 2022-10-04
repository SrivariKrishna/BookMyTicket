
const { Model } = require('objection');

class screens extends Model {
  
  static get tableName() {
    return 'screens';
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
        seats: { type: 'integer' },
        //createdAt:{type: 'time'},
        //updatedAt:{type: 'time'}
       
      }
    };
  }
}

module.exports = screens