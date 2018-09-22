const request = require('request');
module.exports = function (options = { url: '', options: '' }) {
    if (!options || !options.url) {
        options = {
            url: 'http://maau.jugnuagrawal.in',
            options: null
        };
    }
    return (req, res, next) => {
        if (req.headers.authorization) {
            const reqURL = options.url + '/authorized';
            if (options.options) {
                reqURL += ('?options=' + options.options);
            }
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
                        req.body.manageByUser = body._id;
                        req.body.namespace = body.data.namespace;
                    }
                    next();
                }
            });
        } else {
            res.status(401).json({ message: 'You are not authorized to access this.' });
        }
    };
}