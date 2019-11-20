//Make Connection
var socket = io.connect('http://localhost:4000');

//Query DOM
var message = document.getElementById('message');
var submit = document.getElementById('encrypt');

//Prime Number Finder
function prime() {

}

//User input
socket.on('encryptor-div', function(data){
    
    data.message.value = '';
});

//Greatest Common Denominator
function gcd(a, b) {
    if (b == 0) {
        return a;
    }

    return gcd(b, a % b);
}

//Generate Key
function genKey() {
    var a = prime();
    var b = prime();

    var n = a * b;

    var phi = (a - 1) * (b - 1);
    var exp = 2; //starting at 1 could make it easy to crack
    while (exp < phi) {
        if(gcd(exp, phi) == 1) {
            break;
        }
        exp++;
    }
}

//Encrypt input (add generated key to plaintext characters, acceptable range is 32 - 126)
function encryptInput(plainChar, publicExponent, publicKey) {
    var m = plainChar;
    for(var i = 0; i < publicExponent; i++) {
        m *= plainChar;
    }

    m %= publicKey;

    while (m < 32) {
        m += 94;
    }
    while (m > 126) {
        m -= 94;
    }

    return m;
}
