
const { Model } = require('objection');

class theater extends Model {
  
  static get tableName() {
    return 'theater';
  }


  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['theaterName', 'admin'],

      properties: {
        id: { type: 'integer' },
        
        theaterName: { type: 'string', minLength: 1, maxLength: 255 },
        admin: { type: 'string', minLength: 1, maxLength: 255 },
        // createdAt:{type: 'time'},
        // updatedAt:{type: 'time'}
       
      },

     
    }
  }
}

module.exports = theater;
