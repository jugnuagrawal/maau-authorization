const request = require('request');
const log4js = require('log4js');
const logger = log4js.getLogger('authorization');
const loglevel = process.env.LOG_LEVEL || 'info';

log4js.configure({
    appenders: { 'out': { type: 'stdout' }, authorization: { type: 'file', filename: 'logs/authorization.log', maxLogSize: 52428800 } },
    categories: { default: { appenders: ['out', 'authorization'], level: loglevel } }
});

module.exports = function (options = { url: '', options: {} }) {
    if (!options || !options.url) {
        options = {
            url: 'http://maau.jugnuagrawal.in',
            options: null
        };
    }
    return (req, res, next) => {
        if (req.headers.authorization) {
            let reqURL = options.url + '/authorized';
            if (!options.options) {
                options.options = {};
            }
            options.options.method = req.method;
            reqURL += ('?options=' + JSON.stringify(options.options));
            logger.debug('Request URL', reqURL);
            request.get({
                url: reqURL,
                headers: {
                    'authorization': req.headers.authorization
                },
                json: true
            }, function (err, authRes, body) {
                if (err) {
                    logger.error(err);
                    res.status(401).json({ message: 'You are not authorized to access this.' });
                    return;
                }
                logger.debug('Response Code', authRes.statusCode);
                if (authRes.statusCode !== 200 && authRes.statusCode !== 202 && authRes.statusCode !== 204) {
                    res.status(authRes.statusCode).json(body);
                } else {
                    if (!req.query.filter) {
                        req.query.filter = {};
                    }
                    if (options.service !== 'organization') {
                        req.query.filter.organization = body.data.organization;
                    }
                    req.query.filter.namespace = body.data.namespace;
                    req.query.filter = JSON.stringify(req.query.filter);
                    req.userDetails = body;
                    if (req.method == 'POST' || req.method == 'PUT' || req.method == 'DELETE') {
                        req.body.updatedBy = body._id;
                        req.body.namespace = body.data.namespace;
                        req.body.organization = body.data.organization;
                    }
                    next();
                }
            });
        } else {
            res.status(401).json({ message: 'You are not authorized to access this.' });
        }
    };
}