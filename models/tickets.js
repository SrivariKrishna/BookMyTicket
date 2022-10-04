
const { Model } = require('objection');

class tickets extends Model {
  
  static get tableName() {
    return 'tickets';
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
        scheduleId: { type: 'integer' },
        theaterName: { type: 'string', minLength: 1, maxLength: 255 },
        screenName: { type: 'string', minLength: 1, maxLength: 255 },
        movieName:{ type: 'string', minLength: 1, maxLength: 255 },
        movieDate:{type: 'string', minLength: 1, maxLength: 255},
        seatNo: { type: 'integer' },
        bookingStatus: { type: 'string' },
        bookingUserId: { type: 'integer' },
        bookingUserName: { type: 'string' },
        timeFrom:{type: 'string'},
        timeTo:{type: 'string'},
        createdAt:{type: 'string'},
        updatedAt:{type: 'string'}
       
      }
    };
  }
}

module.exports = tickets;