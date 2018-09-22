const request = require('request');
module.exports = function (options = { url: '', options: {} }) {
    if (!options || !options.url) {
        options = {
            url: 'http://maau.jugnuagrawal.in',
            options: null
        };
    }
    return (req, res, next) => {
        if (req.headers.authorization) {
            const reqURL = options.url + '/authorized';
            if (!options.options) {
                options.options = {};
            }
            options.options.method = req.method;
            reqURL += ('?options=' + JSON.stringify(options.options));
            request.get({
                url: reqURL,
                headers: {
                    'authorization': req.headers.authorization
                },
                json: true
            }, function (err, authRes, body) {
                if (err) {
                    res.status(401).json({ message: 'You are not authorized to access this.' });
                    return;
                }
                if (authRes.statusCode !== 200 && authRes.statusCode !== 202 && authRes.statusCode !== 204) {
                    res.status(authRes.statusCode).json(body);
                } else {
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