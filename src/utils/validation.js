
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0 ) return false
    return true
};

const validRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
};

const vaildObjectId = function (objectId) {
    if (objectId.length == 24) return true
    return false
};

const isValidName = function (name)  {
    return /^[a-zA-Z ]{3,30}$/.test(name)
};

const isValidAvailableSizes = function(size) {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size) == true
}

const isValidStatus = function(status) {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
};


module.exports= {isValid,validRequestBody,vaildObjectId,isValidName,isValidAvailableSizes,isValidStatus}  