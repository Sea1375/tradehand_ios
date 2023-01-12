
import moment from 'moment';
import Vue from 'vue';

const DEFAULT_CACHE_TIME = 14400;

export default {
    get (key) {
        let cache = window.sessionStorage.getItem(key);

        if (cache) {
            cache = JSON.parse(cache);
        }

        // If we have a cache entry and it has not expired
        if (cache !== null && cache !== undefined && moment().isBefore(cache.time)) {
            return cache.data;
        }
        else {
            return null;
        }
    },
    httpGet (endpoint) {
        const that = this;
        return new Promise((resolve, reject) => {
            const cache = that.get(endpoint);

            if (cache !== null) {
                resolve(cache);
            }
            else {
                Vue.http.get(endpoint).then((response) => {
                    // Random requests are valid for 10 mins
                    that.set(endpoint, response.data, DEFAULT_CACHE_TIME);
                    resolve(response.data);
                }, (response) => {
                    reject(response.data);
                });
            }
        });
    },
    set (key, data, time) {
        let expireTime;

        if (time === undefined) {
            // Set expire time 1 hour if not given
            expireTime = moment().add(DEFAULT_CACHE_TIME, 's');
        }
        else {
            expireTime = moment().add(time, 's');
        }

        try {
            window.sessionStorage.setItem(key, JSON.stringify({
                time: expireTime,
                data,
            }));
        }
        catch (event) {
            console.error(event);
        }
    },
    clear () {
        try {
            window.sessionStorage.clear();
        }
        catch (event) {
            console.error(event);
        }
    },
    remove (key) {
        try {
            window.sessionStorage.removeItem(key);
        }
        catch (event) {
            console.error(event);
        }
    },
    removeMatching (search) {
        let totalLength = window.sessionStorage.length;

        const keysToRemove = [];

        try {
            while (totalLength--) {
                const key = window.sessionStorage.key(totalLength);

                if (key.startsWith(`/${ search }`)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach((key) => {
                window.sessionStorage.removeItem(key);
            });
        }
        catch (event) {
            console.error(event);
        }
    },
};
