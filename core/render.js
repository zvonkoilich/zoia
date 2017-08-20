const path = require('path');
const config = require(path.join(__dirname, '..', 'etc', 'config.js'));
const nunjucks = require('nunjucks');
const fs = require('mz/fs');

module.exports = class Render {
    constructor(dir, filters, app) {
        if (dir) {
            this.env = new nunjucks.Environment(new nunjucks.FileSystemLoader(dir, { watch: true, noCache: false }));
            this.env.opts.autoescape = false;
        }
        if (filters && this.env) {
            for (let n in filters) {
                this.env.addFilter(n, filters[n], true);
            }
        }
        if (app) {
            this.app = app;
            this.log = app.get('log');
        }
    }
    setFilters(filters) {
        if (filters && this.env) {
            console.log(filters);
            for (let n in filters) {
                try {
                    this.env.getFilter(n);
                } catch(e) {
                    this.env.addFilter(n, filters[n], true);
                }
            }
        }
    }
    _render(file, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.env.render(file, data, function(err, res) {
                if (err && that.log) {
                    that.log.error(err);
                    return reject(err);
                }
                resolve(res);
            });
        });
    }
    async file(file, data) {
        return await this._render(file, data);
    }
    async template(req, i18n, locale, pageTitle, data2, tpl) {
        let template = (tpl || config.website.templates[0]) + '_' + locale + '.html';
        try {
            await fs.access(path.join(__dirname, '..', 'views', template), fs.constants.F_OK);
        } catch (e) {
            template = (tpl || config.website.templates[0]) + '_' + config.i18n.locales[0] + '.html';
        }
        let data1 = {
            i18n: i18n.get(),
            req: req,
            auth: (req && req.session && req.session.auth) ? req.session.auth : false,
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            pageTitle: pageTitle
        };
        let data = Object.assign(data1, data2);
        return await this._render(template, data);
    }
};