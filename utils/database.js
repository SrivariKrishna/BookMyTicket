const {Model} = require('objection');
const Knex = require("knex");
require('dotenv').config();

const knex = Knex({
    client:process.env.db_client,
    connection :{
        host:process.env.db_host,
        user:process.env.db_user,
        password:process.env.db_password,
        database:process.env.db_database
    }
})
Model.knex(knex);
module.exports = knex;