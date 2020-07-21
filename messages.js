const format = require(`${__dirname}/formatting.js`);

module.exports.start = (message) => {
  return `Welcome <i>${message.username}</i>`;
};

module.exports.help = () => {
  return `\rCommands:\n\n\r/status - Router Status\n\r/dhcp_server - DHCP Server Info\n\r/dhcp_client - DHCP Client Info\n\r/wlan - WLAN\n\r
  `;
};

module.exports.denied = () => {
  return `<b>Denied</b>`;
};

module.exports.status = (data) => {
  const { identity, resource, system } = data;

  return `<b>Router Status</b>:\n\nName: <i>${identity.name}</i>\nCPU: <i>${resource['cpu-load']}%</i>\nRAM: <i>${format.toDataUnit(parseInt(resource['free-memory']))}</i> / <i>${format.toDataUnit(parseInt(resource['total-memory']))}</i>\nROM: <i>${format.toDataUnit(parseInt(resource['free-hdd-space']))}</i> / <i>${format.toDataUnit(parseInt(resource['total-hdd-space']))}</i>\nUptime: <i>${resource.uptime}</i>\nSystem Date: <i>${system.date}</i>\nSystem Time: <i>${system.time}</i>`;
};

module.exports.dhcpServer = (data) => {
  const { networkData, leaseData } = data;
  let serverMessage = '<b>Servers</b>:\n';
  let hostMessage = '<b>Hosts</b>:\n';

  for(let row of networkData) {
    serverMessage += `Address: <i>${row.address}</i>\nGateway: <i>${row.gateway}</i>\n\n`;
  }

  for(let row of leaseData) {
    hostMessage += `Host: <i>${row['host-name']}</i>\nMAC: <code>${row['mac-address']}</code>\nIP: ${row.address}\nStatus: <b>${row.status}</b> / Dynamic: <b>${row.dynamic}</b>\nExp: <i>${row['expires-after']}</i> / Ls: <i>${row['last-seen']}</i>\n\n`
  }

  return `${serverMessage}${hostMessage}`;
};

module.exports.dhcpClient = (data) => {
  let message = '<b>Clients</b>:\n';

  for(let row of data) {
    message += `Address: <i>${row.address}</i>\nInterface: <i>${row.interface}</i>\nStatus: <b>${row.status}</b>\nDHCP Server: ${row['dhcp-server']}\nExp: <i>${row['expires-after']}</i>\nDNS: ${row['primary-dns']}, ${row['secondary-dns']}\nNTP: ${row['primary-ntp']}\n\n`;
  }

  return message;
};

module.exports.wirelessConnection = (data) => {
  let message = '<b>WLAN</b>:\n';

  for(let row of data) {
    const packets = row.packets.split(',');
    const frames = row.frames.split(',');
    const bytes = row.bytes.split(',');
    const sentPackets = packets[0], receivedPackets = packets[1];
    const sentFrames = frames[0], receivedFrames = frames[1];
    const sentBytes =parseInt(bytes[0]), receivedBytes = parseInt(bytes[1]);

    message += `MAC: <code>${row['mac-address']}</code>\nIP: ${row['last-ip']}\nInterface: <i>${row.interface}</i>\nUptime: <i>${row.uptime}</i>\nPackets(U/D): <i>${sentPackets}</i> / <i>${receivedPackets}</i>\nFrames(U/D): <i>${sentFrames}</i> / <i>${receivedFrames}</i>\nBytes(U/D): <i>${format.toDataUnit(sentBytes)}</i> / <i>${format.toDataUnit(receivedBytes)}</i>\nLast Activity: <i>${row['last-activity']}</i>\n\n`;
  }

  return message;
};

module.exports.fileSystemData = (data) => {
  let message = '<b>Files</b>:\n';

  for(let row of data) {
    message += `<code>${row.name}</code>\n<i>${row.type}</i> <i>${format.toDataUnit(parseInt(row.size))}</i>\nDate: <i>${row['creation-time']}</i>\n\n`;
  }

  return message;
};

module.exports.backupFile = () => {
  let message = `Backup File was created`;

  return message;
};