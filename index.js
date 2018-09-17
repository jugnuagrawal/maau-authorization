const request = require('request');
module.exports = function (options = { url: '' }) {
    if (!options || !options.url) {
        options = {
            url: 'http://maau.jugnuagrawal.in'
        };
    }
    return (req, res, next) => {
        if (req.headers.authorization) {
            request.get({
                url: options.url + '/validate',
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
                    next();
                }
            });
        } else {
            res.status(401).json({ message: 'You are not authorized to access this.' });
        }
    };
}