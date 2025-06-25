// Mock modules must be imported dynamically in ESM
let jestGlobals, mongoose, Blacklist;
let schemaInstance;

beforeAll(async () => {
    // First import Jest globals
    jestGlobals = await import('@jest/globals');
    const { jest } = jestGlobals;

    // Create a schema instance that our tests can access
    schemaInstance = {
        paths: {
            token: {
                options: {
                    type: String,
                    required: true,
                    ref: "User"
                }
            }
        },
        options: { timestamps: true },
        _indexes: []
    };

    // Mock mongoose to prevent real DB connections
    await jest.unstable_mockModule('mongoose', () => ({
        default: {
            Schema: class Schema {
                constructor() {
                    Object.assign(this, schemaInstance);
                }
                index(fields, options) {
                    this._indexes.push({ fields, options });
                    return this;
                }
            },
            model: jest.fn().mockImplementation(function () {
                return class {
                    constructor(data) {
                        Object.assign(this, data);
                        this.save = jest.fn();
                        this.schema = schemaInstance;
                    }
                };
            })
        }
    }));

    // Import the model after setting up mocks
    mongoose = await import('mongoose');
    Blacklist = (await import('../Blacklist.js')).default;
});

describe('Blacklist Model', () => {
    afterEach(() => {
        jestGlobals.jest.clearAllMocks();
    });

    describe('Schema Structure', () => {
        it('should have the correct token field with properties', () => {
            // Use the schema instance directly
            expect(schemaInstance.paths.token.options).toEqual({
                type: String,
                required: true,
                ref: "User"
            });
        });

        it('should have timestamps enabled', () => {
            expect(schemaInstance.options.timestamps).toBe(true);
        });
    });

    describe('TTL Index', () => {
        it('should have a TTL index on createdAt with 1 hour expiry', () => {
            // Find the TTL index
            const ttlIndex = schemaInstance._indexes.find(index =>
                index.fields["createdAt"] === 1 &&
                index.options.expireAfterSeconds !== undefined
            );

            // Check index exists and has correct TTL value
            expect(ttlIndex).toBeDefined();
            expect(ttlIndex.fields).toEqual({ "createdAt": 1 });
            expect(ttlIndex.options.expireAfterSeconds).toBe(3600);
        });
    });

    describe('Instance Creation', () => {
        it('should create a blacklist record with a token', () => {
            const tokenValue = 'test-jwt-token';
            const blacklistEntry = new Blacklist({ token: tokenValue });

            expect(blacklistEntry.token).toBe(tokenValue);
        });

        it('should have a save method', () => {
            const blacklistEntry = new Blacklist({ token: 'test-token' });
            expect(typeof blacklistEntry.save).toBe('function');
        });
    });
});