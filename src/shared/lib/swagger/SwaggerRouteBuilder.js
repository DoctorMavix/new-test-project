const fs = require('fs');
const path = require('path');

module.exports = class SwaggerRouteBuilder {
    constructor(groupDescription = '', tags = []) {
        this.groupDescription = groupDescription;
        this.tags = tags;
        this.routes = {}; // Store routes grouped by basePath
    }

    addRoute(basePath, httpMethod, summary, tags = []) {
        this.currentPath = basePath;
        this.currentHttpMethod = httpMethod;

        const route = {
            summary,
            tags,
            parameters: [],
            requestBody: null,
            responses: {}
        };

        if (!this.routes[basePath]) {
            this.routes[basePath] = {};
        }

        this.routes[basePath][httpMethod] = route;
        this.currentRoute = this.routes[basePath][httpMethod];

        return this; // Return 'this' to allow chaining
    }

    addPathParam(name, type, description, required = true) {
        if (!this.routes[this.currentPath]) {
            throw new Error(`Route ${this.currentPath} not defined.`);
        }
        this.routes[this.currentPath][this.currentHttpMethod].parameters.push({ in: 'path',
            name,
            schema: { type },
            description,
            required,
        });
        return this;
    }

    addQueryParam(name, type, description, required = false) {
        this.routes[this.currentPath][this.currentHttpMethod].parameters.push({ in: 'query',
            name,
            schema: { type },
            description,
            required,
        });
        return this;
    }

    // Adds a $ref schema as request body (application/json)
    addRequestBody(schemaRef, description = 'Request body description') {
        if (!this.routes[this.currentPath]) {
            throw new Error(`Route ${this.currentPath} not defined.`);
        }

        const currentRequestBody = this.currentRoute.requestBody;

        // If requestBody already exists and is multipart, convert the request body to multipart/form-data
        if (currentRequestBody && currentRequestBody.content['multipart/form-data']) {
            this.addSchemaToMultipart(schemaRef);
        } else {
            this.routes[this.currentPath][this.currentHttpMethod].requestBody = {
                description,
                content: {
                    'application/json': {
                        schema: { $ref: schemaRef },
                    },
                },
            };
        }

        return this;
    }

    // Method to handle file uploads
    addFileUpload(fieldName, description = 'File upload', required = false) {
        if (!this.routes[this.currentPath]) {
            throw new Error(`Route ${this.currentPath} not defined.`);
        }

        const currentRequestBody = this.currentRoute.requestBody;

        // If we already have a request body, convert it to multipart/form-data if necessary
        if (currentRequestBody && currentRequestBody.content['application/json']) {
            this.convertToMultipart();
        }

        // Ensure multipart/form-data is used
        if (!currentRequestBody || !currentRequestBody.content['multipart/form-data']) {
            this.routes[this.currentPath][this.currentHttpMethod].requestBody = {
                description: 'Multipart form-data for file upload',
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                [fieldName]: {
                                    type: 'string',
                                    format: 'binary',
                                    description,
                                },
                            },
                        },
                    },
                },
                required,
            };
        } else {
            // Add the file field to the existing multipart/form-data schema
            this.routes[this.currentPath][this.currentHttpMethod].requestBody.content['multipart/form-data'].schema.properties[fieldName] = {
                type: 'string',
                format: 'binary',
                description,
            };
        }

        return this;
    }

    // Method to add additional form fields to multipart/form-data
    addFormField(fieldName, type = 'string', description = 'Form field description', required = false) {
        if (!this.routes[this.currentPath]) {
            throw new Error(`Route ${this.currentPath} not defined.`);
        }

        const currentRequestBody = this.currentRoute.requestBody;

        // If no requestBody exists, create one with multipart/form-data
        if (!currentRequestBody || !currentRequestBody.content['multipart/form-data']) {
            this.routes[this.currentPath][this.currentHttpMethod].requestBody = {
                description: 'Multipart form-data with additional fields',
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                [fieldName]: {
                                    type,
                                    description,
                                },
                            },
                        },
                    },
                },
                required,
            };
        } else {
            // Add the additional field to the existing multipart/form-data schema
            this.routes[this.currentPath][this.currentHttpMethod].requestBody.content['multipart/form-data'].schema.properties[fieldName] = {
                type,
                description,
            };
        }

        return this;
    }

    // Convert any existing requestBody to multipart/form-data and preserve existing fields
    convertToMultipart() {
        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody.content['application/json']) {
            const jsonSchema = currentRequestBody.content['application/json'].schema;
            this.routes[this.currentPath][this.currentHttpMethod].requestBody = {
                description: 'Multipart form-data',
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                data: {
                                    allOf: [jsonSchema], // Keep the original JSON schema in multipart form
                                },
                            },
                        },
                    },
                },
            };
        }
    }

    // Adds a schema reference to multipart request body
    addSchemaToMultipart(schemaRef) {
        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody && currentRequestBody.content['multipart/form-data']) {
            currentRequestBody.content['multipart/form-data'].schema.properties.data = {
                allOf: [{ $ref: schemaRef }],
            };
        }
    }

    // Add response
    addResponse(statusCode, description, schemaRef = null) {
        if (!this.routes[this.currentPath]) {
            throw new Error(`Route ${this.currentPath} not defined.`);
        }
        const content = schemaRef ? {
            'application/json': {
                schema: { $ref: schemaRef },
            },
        } : {};
        this.routes[this.currentPath][this.currentHttpMethod].responses[statusCode] = { description, content };
        return this;
    }

    // Build all routes
    build() {
        return this.routes;
    }
    generateFileName() {
        return this.groupDescription.toLowerCase().replace(/ /g, '-');
    }


    saveToFile(fileName, dirPath = 'swagger/routes') {
        if (process.env.NODE_ENV === 'development') {
            if (!fileName) fileName = this.generateFileName();
            const filePath = path.join(dirPath, `${fileName}.json`);

            fs.mkdirSync(dirPath, { recursive: true });

            fs.writeFileSync(filePath, JSON.stringify(this.build(), null, 2), 'utf8');
            console.log(`Swagger doc saved to ${filePath}`);
        }
    }

    saveToModuleSpecFolder(moduleName, fileName) {
        if (process.env.NODE_ENV === 'development') {
            if (!fileName) fileName = this.generateFileName();

            const moduleDirPath = path.join(__dirname, `../../../modules/${moduleName}/swagger/_spec`);

            if (!fs.existsSync(path.join(__dirname, `../../../modules/${moduleName}`))) {
                throw new Error(`Module "${moduleName}" does not exist.`);
            }

            fs.mkdirSync(moduleDirPath, { recursive: true });

            const filePath = path.join(moduleDirPath, `${fileName}.json`);

            fs.writeFileSync(filePath, JSON.stringify(this.build(), null, 2), 'utf8');
            // console.log(`Swagger doc saved to ${filePath}`);
        }
    }
};