'use strict'

const RosApi = require('node-routeros').RouterOSAPI;
const { Telegraf } = require('telegraf');
const messageTemplates = require(`${__dirname}/messages.js`);
 
(async () => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const users = process.env.USERS;

  const connectionSettings = new RosApi({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    keepalive: true
  });

  let mikrotikConnection = null;
  let telegramBot = null;

	try {
    telegramBot = new Telegraf(BOT_TOKEN);
    const mikrotikConnection = await connectionSettings.connect();

    console.log('Connected to Mikrotik Router');

    // Check allowed User.
    telegramBot.use(async (ctx, next) => {
      if (users.includes(ctx.message.from.id)) {
        await next();
      } else {
        await ctx.replyWithHTML(messageTemplates.denied())
      }
    });



    telegramBot.start((ctx) => ctx.replyWithHTML(messageTemplates.start(ctx.message.from)));

    telegramBot.help((ctx) => ctx.replyWithHTML(messageTemplates.help()));

    telegramBot.command('status', async (ctx) => {
      const identityData = await mikrotikConnection.write('/system/identity/print');
      const resourceData = await mikrotikConnection.write('/system/resource/print');
      const systemDateTimeData = await mikrotikConnection.write('/system/clock/print');
      const data = {
        identity: identityData[0],
        resource: resourceData[0],
        system: systemDateTimeData[0]
      }

      await ctx.replyWithHTML(messageTemplates.status(data));
    });

    telegramBot.command('dhcp_server', async (ctx) => {
      const dhcpServerNetworkData = await mikrotikConnection.write('/ip/dhcp-server/network/print');
      const dhcpServerLeaseData = await mikrotikConnection.write('/ip/dhcp-server/lease/print');
      const data = {
        networkData: dhcpServerNetworkData,
        leaseData: dhcpServerLeaseData
      }

      await ctx.replyWithHTML(messageTemplates.dhcpServer(data));
    });

    telegramBot.command('dhcp_client', async (ctx) => {
      const dhcpClientNetworkData = await mikrotikConnection.write('/ip/dhcp-client/print');

      await ctx.replyWithHTML(messageTemplates.dhcpClient(dhcpClientNetworkData));
    });

    telegramBot.command('wlan', async (ctx) => {
      const wirelessConnectionData = await mikrotikConnection.write('/interface/wireless/registration-table/print');

      await ctx.replyWithHTML(messageTemplates.wirelessConnection(wirelessConnectionData));
    });

    telegramBot.command('file', async (ctx) => {
      const fileSystemData = await mikrotikConnection.write('/file/print');

      await ctx.replyWithHTML(messageTemplates.fileSystemData(fileSystemData));
    });

    // telegramBot.command('del_file', async (ctx) => {
    //   const command = ctx.update.message.text.split(' ');
    //   const fileSystemData = await mikrotikConnection.write([`/file/remove`, `[find =name="${command[1]}"]`]);

    //   console.log(fileSystemData)

    //   // await ctx.replyWithHTML(messageTemplates.fileSystemData(fileSystemData));
    // });

    telegramBot.command('backup', async (ctx) => {
      await mikrotikConnection.write('/system/backup/save');

      await ctx.replyWithHTML(messageTemplates.backupFile());
    });

    telegramBot.catch((err, ctx) => {
      console.error(`Bot Error: ${ctx.updateType}`, err);
    })

    telegramBot.launch();
  } catch(error) {
    console.error(`Error: ${error.message}`);
  }
})();