module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    let configModule;
    try {
        configModule = require(path.join(__dirname, 'config', 'blog.json'));
    } catch (e) {
        configModule = require(path.join(__dirname, 'config', 'blog.dist.json'));
    }
    app.get('log').info('[blog] module loaded');
    return {
        frontend: {
            prefix: configModule.prefix.blog,
            routes: frontend.routes,
            filters: frontend.filters
        },
        backend: {
            prefix: '/blog',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/blog',
            routes: api.routes
        }
    };
};