// var x = require("sayHi.txt") error
// using commonJS require module will throw error
// use commonJS module ---> module.exports in loader source
// use es module ---> import in js
import txt from './sayHi.txt';


// common.js is exported by common module style
// but import with es6 module
import str from "./common.js"

document.write("hello , I like u <br>"
  + txt + "<br>"
+ str)