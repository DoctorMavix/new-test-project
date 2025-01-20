const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// Class to handle loading of Swagger schemas and spec files
module.exports = class SwaggerLoader {

    constructor() {
            this.schemas = {};
            this.specFiles = [];
            this.paths = {};
            this.modulesPath = path.resolve(__dirname, '../../../modules');
            this.privateSpecsPath = path.resolve(__dirname, '../../../swagger/specs/private');

            this.title = 'API Documentation'
            this.version = '1.0.0'
            this.description = 'API for managing resources'

        }
        // set title
    setTitle(title) {
        this.title = title
    }

    // set description
    setDescription(description) {
        this.description = description
    }

    // set version
    setVersion(version) {
        this.version = version
    }

    // Load schemas from the modules' _swagger directories
    loadSchemas() {
        if (fs.existsSync(this.modulesPath)) {
            fs.readdirSync(this.modulesPath).forEach(module => {
                const schemaDir = path.join(this.modulesPath, module, 'swagger/schema/');
                if (fs.existsSync(schemaDir)) {
                    fs.readdirSync(schemaDir).forEach(schemaFile => {
                        const schemaPath = path.join(schemaDir, schemaFile);
                        const moduleSchemas = require(schemaPath);
                        this.schemas = {...this.schemas, ...moduleSchemas };
                    });
                }
            });
        }
    }

    // Load Swagger spec files from both module directories and private directory
    loadSpecFiles() {
        // Load spec files from modules
        if (fs.existsSync(this.modulesPath)) {
            fs.readdirSync(this.modulesPath).forEach(module => {
                const specDir = path.join(this.modulesPath, module, 'swagger/_spec/');
                if (fs.existsSync(specDir)) {
                    fs.readdirSync(specDir).forEach(specFile => {
                        const specPath = path.join(specDir, specFile);
                        this.specFiles.push(specPath);
                    });
                }
            });
        }

        // Load private spec files (from SwaggerRouteBuilder)
        if (fs.existsSync(this.privateSpecsPath)) {
            fs.readdirSync(this.privateSpecsPath).forEach(file => {
                const specPath = path.join(this.privateSpecsPath, file);
                this.specFiles.push(specPath);
            });
        }
    }

    // Merge all loaded spec files into a paths object
    mergeSpecs() {
        for (const specFile of this.specFiles) {
            const pathSpec = require(specFile);
            this.paths = {...this.paths, ...pathSpec };
        }
    }

    // Build Swagger options
    buildSwaggerOptions() {
        return {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: this.title,
                    version: this.version,
                    description: this.description,
                },
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                        apiKeyAuth: {
                            type: 'apiKey',
                            in: 'header',
                            name: 'X-API-KEY',
                        },
                    },
                    schemas: this.schemas, // Loaded schemas
                },
                security: [{ bearerAuth: [] }], // JWT Bearer auth by default
                paths: this.paths, // Merged paths from spec files
            },
            apis: ['src/modules/**/routes/*.js'], // Load route files
        };
    }

    // Generate Swagger documentation object
    generateSwaggerDocs() {
        return swaggerJsdoc(this.buildSwaggerOptions());
    }
}