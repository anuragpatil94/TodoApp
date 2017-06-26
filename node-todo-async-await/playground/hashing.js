const { SHA256 } = require('crypto-js');

var message = 'I am user number 3';
var hash = SHA256(message).toString();
console.log(message);
console.log(hash);

/**
 * Data server------>client
 * Send an object 'data' which contains:
 * id- will have the same user id.. this will make sure which user is 
 * making the request as well as which user is associated to this data object.
 * SO that only the user having same id can make changes to the data.
 */
var data = {
    //id:user.id

};
/**
 * This is used, suppose a user changed the id for data from 4 to 5 and then initialized delete cocmmand to delete records of user with id-5 instead of 4 which would be a security flaw
 * token we send back to the user.
 * data- property which the above data object
 * hash- property which is the hashed value of the data.
 */
var token = {
    data,
    hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
}
/**
 * This is still not full proof.. since a person can update data aswell as the hash value which compromises the integrity
 * 
 * Hence we add some random string on top of hashed value so that  we wont get the same hash value again. this is known as salt
 */

token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();

//store hash of data that comes back
var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

if (resultHash === token.hash) {
    console.log('Data was not changed');
} else {
    console.log('Data was changed');

}