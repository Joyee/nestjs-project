// const { exec } = require('child_process')

// const childProcess = exec('tail -f ./log')

// childProcess.stdout.on('data', (msg) => {
//   console.log(msg)
// })

const { readFileSync } = require('fs')

const buffer = readFileSync('./package.json')
console.log(buffer.toJSON())