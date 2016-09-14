const net = require('net');

// NuSPICE Box ports
const nu = {
  ports: {
    send: 50000,
    events: 50014
  },
  devices: []
}

// You'll need to install arp-scan on your machine first
//    (mac) brew install arp-scan
//    (linux) sudo apt-get install arp-scan
const scanner = require('arpscan');

// THIS WILL HELP YOU SORT OUT WHICH DEVICES ON THE NETWORK ARE NuLEDs
function scan_results(err, data) {
  if (err) throw err;
  data.forEach(function(device) {
    if (device.vendor == 'NuLEDs, Inc.') {
      console.log("ip", device.ip);
      console.log("mac", device.mac);
      console.log('---------------------');
      console.log('---------------------');
      nu.devices.push(device);
    }
  })
};

const run_scan = function() {
  scanner(scan_results);
  return "scanning";
}

// IT MIGHT PROVE USEFUL TO HAVE SOME PROMPTING FUNCTIONALITY
const prompt = require('prompt');

const brian = (function() {
  return "Brian Nicholas";
}).call(this);

const repl = require('repl');
const replServer = repl.start({
  prompt: "have fun > ",
});


const udp = require('dgram');
const message = Buffer.from('Some bytes');
const socket = udp.createSocket('udp4');

const send_command = (function() {
  prompt.start();
  prompt.get([{
      name: 'ip_address',
      description: 'Enter the ip of the device you want to send a command to',
      type: 'string',
      // pattern: /^\w+$/,
      // message: 'Password must be letters',
      hidden: false,
      default: '192.168.1.159',
      required: true,
      // before: function(value) { return 'v' + value; } // Runs before node-prompt callbacks. It modifies user's input
    }, {
      name: 'command',
      description: 'Enter the string command',
      required: true,
      hidden: false,
      default: 'A255R255G255B255W0S255F4;',
      required: true,
    }],
    function(err, result) {
      socket.send(result.command, nu.ports.send, result.ip_address, function() {
        console.log("------------------------");
        socket.on('message', (msg, rinfo) => {
          console.log(msg.toString('utf8'), rinfo);
        });
      })
    });

}).call(this);

// attach my modules to the repl context
replServer.context.scan = run_scan;
replServer.context.brian = brian;
replServer.context.devices = nu.devices;
replServer.context.ports = nu.ports;
replServer.context.send = send_command;
