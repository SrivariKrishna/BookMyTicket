let statusCode = {
    "OK":200,
    "Forbidden": 403,
    "NotFound":404 ,
    "Unauthorized":401,
    "Internal Server Error":500
}

let errorMessage = {
    "OK":"Success",
    "Forbidden": "Not Allowed",
    "NotFound":"Endpoint not found" ,
    "Unauthorized":"You are not authorized",
    "Internal Server Error":"Internal server error"
}

module.exports = {statusCode,errorMessage}