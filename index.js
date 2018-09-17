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
                url: options.url,
                headers: {
                    'authorization': req.headers.authorization
                }
            }, function (err, res, body) {
                if (err) {
                    res.status(401).json({ message: 'You are not authorized to access this.' });
                    return;
                }
                if (res.statusCode !== 200 || res.statusCode !== 202 || res.statusCode !== 204) {
                    res.status(res.statusCode).json(body);
                } else {
                    next();
                }
            });
        } else {
            res.status(401).json({ message: 'You are not authorized to access this.' });
        }
    };
}