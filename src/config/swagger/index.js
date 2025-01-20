const swaggerUi = require('swagger-ui-express');
const SwaggerLoader = require('../../shared/lib/swagger/SwaggerLoader');

async function bootstrap(app) {

    const swaggerLoader = new SwaggerLoader();
    swaggerLoader.setTitle('Backend Test API Documentation');
    swaggerLoader.setDescription('API for managing resources');
    swaggerLoader.setVersion('1.0.0');
    swaggerLoader.loadSchemas();
    swaggerLoader.loadSpecFiles();
    swaggerLoader.mergeSpecs();
    const swaggerDocs = swaggerLoader.generateSwaggerDocs();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    console.log('Swagger UI is available at /api-docs'.blue.bold);

}

module.exports = bootstrap