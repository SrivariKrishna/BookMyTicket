
const { Model } = require('objection');

class user extends Model {
  
  static get tableName() {
    return 'users';
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
        userName: { type: ['string', 'null'] },
        password: { type: 'string', minLength: 1, maxLength: 255 },
        accessLevel: { type: 'integer', minLength: 1, maxLength: 255 },
        //createdAt: { type: 'time' },
        //updatedAT: { type: 'time' },

       
      }
    };
  }
}

module.exports = user