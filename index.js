const request = require('request');
module.exports = function (options = { url: '', operation: '' }) {
    if (!options || !options.url) {
        options = {
            url: 'http://maau.jugnuagrawal.in',
            operation: null
        };
    }
    return (req, res, next) => {
        if (req.headers.authorization) {
            const reqURL = options.url + '/authorized';
            if (options.operation) {
                reqURL += ('?operation=' + options.operation);
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
                    if(req.method == 'POST' || req.method == 'PUT' || req.method == 'DELETE'){
                        req.body.manageByUser = body._id;
                    }
                    next();
                }
            });
        } else {
            res.status(401).json({ message: 'You are not authorized to access this.' });
        }
    };
}