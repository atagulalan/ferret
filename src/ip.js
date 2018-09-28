var os = require('os');
var ifaces = os.networkInterfaces();
const Table = require('cli-table');
const table = new Table();

exports.showIPs = function(port) {
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            table.push({ [ifname]: iface.address+":"+port });
        });
    });
    console.log(table.toString());
}