const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var data = {
    id: 10

};
var password = '123abc';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt,(err,hash)=>{
        console.log(hash);
        
    });
});

var token = jwt.sign(data, '123abc');
console.log(token);
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImlhdCI6MTQ5NzQ1NDU5Mn0.KHWCgmeT5JqcSx5J3paqgBWJo6E2ORcmSBF79BBP-E0

var decoded = jwt.verify(token, '123abc');
console.log(decoded);
//{ id: 10, iat: 1497454592 }