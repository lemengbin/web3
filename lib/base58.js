var CryptoJS = require('crypto-js');
var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; // 58 characters
var ALPHABET_MAP = {};
for (var i = 0; i < 58; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
}

var Base58Encode = function (arr) {
    if (arr.length === 0)
        return '';

    var i, j, digits = [0];
    for (i = 0; i < arr.length; i++) {
        for (j = 0; j < digits.length; j++) {
            digits[j] <<= 8;
        }

        digits[0] += arr[i];
        var carry = 0;
        for (j = 0; j < digits.length; ++j) {
            digits[j] += carry;
            carry = (digits[j] / 58) | 0;
            digits[j] %= 58;
        }
        while (carry) {
            digits.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    }

    // deal with leading zeros
    for (i = 0; arr[i] === 0 && i < arr.length - 1; i++)
        digits.push(0);
    return digits.reverse().map(function(digit) { return ALPHABET[digit]; }).join('');
};

var Base58Decode = function (str) {
    if (str.length === 0)
        return [];

    var i, j, bytes = [0];
    for (i = 0; i < str.length; i++) {
        var c = str[i];
        if (!(c in ALPHABET_MAP))
            throw new Error('Non-base58 character');

        for (j = 0; j < bytes.length; j++)
            bytes[j] *= 58;
        bytes[0] += ALPHABET_MAP[c];

        var carry = 0;
        for (j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }
        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    // deal with leading zeros
    for (i = 0; str[i] === '1' && i < str.length - 1; i++)
        bytes.push(0);

    return bytes.reverse();
};

var BytesToString = function (arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        var tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = "0" + tmp;
        }
        str += tmp;
    }
    return str;
};

var StringToBytes = function (str) {
    var len = str.length;
    if (len % 2 != 0) {
        return null;
    }
    len /= 2;

    var arr = new Array();
    var pos = 0;
    for (var i = 0; i < len; i++) {
        var tmp = str.substr(pos, 2);
        var v = parseInt(tmp, 16);
        arr.push(v);
        pos += 2;
    }
    return arr;
};

var AddressToBase58Address = function (value) {
    var buff = '0FA2' + value.slice(value.length - 40, value.length);
    var hash1 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(buff));
    var hash2 = CryptoJS.SHA256(hash1).toString();
    return Base58Encode(StringToBytes(buff + hash2.slice(0, 8)));
};

var Base58AddressToAddress = function (value) {
     return "0x" + BytesToString(Base58Decode(value).slice(2, 22));
};

module.exports = {
    AddressToBase58Address: AddressToBase58Address,
    Base58AddressToAddress: Base58AddressToAddress
};