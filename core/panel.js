const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = class Panel {
    constructor(app) {
        this.app = app;
        this.render = new(require(path.join(__dirname, 'render.js')))(path.join(__dirname, 'views'));
        this.i18n = new(require(path.join(__dirname, 'i18n.js')))(path.join(__dirname, 'lang'), app);
    }
    async html(req, id, title, data) {
        const locale = req.session.currentLocale;
        return await this.render.file("panel.html", {
            i18n: this.i18n.get(),
            locale: locale,
            config: config,
            data: data,
            moduleId: id,
            moduleName: title,
            modules: this.app.get('backendModules')
        });
    }
}