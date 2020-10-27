const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.TGTOKEN);

const { MTProto, getSRPParams } = require('@mtproto/core');
const mtproto = new MTProto({
  api_id: process.env.TG_API_ID,
  api_hash: process.env.TG_API_HASH,
});

const api = {
  call(method, params, options = {}) {
    return mtproto.call(method, params, options).catch(async error => {
      console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 303) {
        const [type, dcId] = error_message.split('_MIGRATE_');

        // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await mtproto.setDefaultDc(+dcId);
        } else {
          options = {
            ...options,
            dcId: +dcId,
          };
        }

        return this.call(method, params, options);
      }

      return Promise.reject(error);
    });
  },
};

module.exports = api;


bot.start((ctx) => {
  ctx.reply(`Hello there ${ctx.message.from.first_name} ${ctx.message.from.last_name}`);
});

bot.help((ctx) => {
  ctx.reply("HELP MESSAGE...");
});

bot.command('test', (ctx) => {
  ctx.reply(`Hello ${ctx.message.from.first_name} ${ctx.message.from.last_name}, this is a TEST!`);
});

bot.command('auth', (ctx) => {
  
});

bot.command('wipe', (ctx) => {
  const chat_id = ctx.message.chat.id;
  ctx.reply(`Preparing to wipe history for chat id ${chat_id}`);

  mtproto.call('messages.deleteHistory', {
    revoke: true,
    peer: {
      _: 'inputPeerChat',
      chat_id
    },
  }).then(result => {
    console.log('result:', result);
  }).catch(error => {
    console.log('error.error_code:', error.error_code);
    console.log('error.error_message:', error.error_message);
  })
});

bot.on('text', (ctx) => {
  ctx.reply(`Hello!`);
});


const PORT = process.env.PORT;
const URL = process.env.BASE_URL + "webhook";
console.log ("Registering webhook:" + URL );
bot.telegram.setWebhook(URL);
bot.startWebhook('/webhook', null, PORT);


function sendCode(phone) {
  return api.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  });
}

function signIn({ code, phone, phone_code_hash }) {
  return api.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  });
}

function getPassword() {
  return api.call('account.getPassword');
}

async function checkPassword({ srp_id, A, M1 }) {
  return api.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  });
}