const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Router = require('co-router');
const fs = require('fs');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));

let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'support.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'support.dist.json'));
} 

const moduleURL = '/support';
let templateList = 'frontend.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateList))) {
    templateList = 'custom_' + templateList;
}


module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const db = app.get('db');
    const renderHosting = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);
    const log = app.get('log');

    const list = async(req, res, next) => {
        if (!Module.isAuthorized(req)) {
            return res.redirect(303, (config.website.authPrefix || '/auth') + '?redirect=' + moduleURL + '&_=' + Math.random().toString().replace('.', ''));
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        try {
            let listHTML = await renderHosting.file(templateList, {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                configModule: configModule,
                username: req.session.auth.username,
            });
            let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Support'), {
                content: listHTML,
                extraCSS: config.production ? ['/support/static/css/frontend.min.css'] : ['/support/static/css/frontend.css'],
                extraJS: config.production ? ['/support/static/js/frontend.min.js'] : ['/zoia/core/js/jquery.zoiaTable.js', '/support/static/js/frontend.js']
            });
            res.send(html);
        } catch (e) {
            log.error(e);
            return next();
        }
    };

    let router = Router();
    router.get('/', list);

    return {
        routes: router
    };
};