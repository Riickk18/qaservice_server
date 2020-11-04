const CryptoJS = require('crypto-js');
const crypto = require("crypto");
module.exports = {
    encrypt_cryptojs: function encrypt_cryptojs(message, password, iv64, salt) {
        var hash = CryptoJS.SHA256(salt);
        var key = CryptoJS.PBKDF2(password, hash, { keySize: 256/32, iterations: 1000 });
        var iv  = CryptoJS.enc.Base64.parse(iv64);
        var encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv });
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    },

// Use built-in crypto module.
    encrypt: function encrypt(message, password, iv64, salt) {
        const iv = Buffer.from(iv64, 'base64');
        const hash = crypto.createHash('sha256').update(salt, 'utf8').digest()
        const key = crypto.pbkdf2Sync(password, hash, 1000, 32, null);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(message, 'utf8', 'base64')
        encrypted += cipher.final('base64');
        return encrypted;
    },

    decrypt: function decrypt(messagebase64, password, iv64) {

        const iv = Buffer.from(iv64, 'base64');
        const hash = crypto.createHash('sha256').update(salt, 'utf8').digest()
        const key = crypto.pbkdf2Sync(password, hash, 1000, 32, null);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(messagebase64, 'base64');
        decrypted += decipher.final();
        return decrypted;
    }
}