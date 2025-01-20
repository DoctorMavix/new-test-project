/**************************************************
 * @bootstrap
 */
const dotenv = require('dotenv');
dotenv.config();

require('colors');
const DBConnection = require('../db/connection'); // Your existing DB connection function

async function bootstrap() {
    console.log('Initializing application...'.cyan);

    // Connect to MongoDB
    await DBConnection();

    console.log('Application initialized.'.green);
}

module.exports = bootstrap;