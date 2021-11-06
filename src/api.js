const { MTProto } = require('@mtproto/core');
const { sleep } = require('@mtproto/core/src/utils/common');
const path = require('path')
const mtproto = new MTProto({
  api_id: "3776286",
  api_hash: "9992bcd0ae86470d30cc6786d53c23d4",
  
  storageOptions: {
    path: path.resolve(__dirname, './data/1.json'),
  },
});

const api = {
  call(method, params, options = {}) {
    return mtproto.call(method, params, options).catch(async error => {
      console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 420) {
        const seconds = +error_message.split('FLOOD_WAIT_')[1];
        const ms = seconds * 1000;

        await sleep(ms);

        return this.call(method, params, options);
      }

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