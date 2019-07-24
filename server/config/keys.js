var args = process.argv.slice(2)

if (args[0]=="prod") {
    module.exports = require("./prodKeys")
}else if (args[0]=="dev"){
    module.exports = require("./localKeys")
}