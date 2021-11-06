import api from './api'
var SpotifyWebApi = require('spotify-web-api-node');

const express = require('express')
const app = express()
const port = 3000


var http = require('https'),
    fs = require('fs')




var spotifyApi = new SpotifyWebApi({
    clientId: '033a5785aedc4f3d81d9c0e3549a9d05',
    clientSecret: '8febd347a0ce4380b27fb6a873ab092f',    
  });

  spotifyApi.setAccessToken('BQAG4Gcpj8m-_ITpLKTVY9FaRCpqJLUUGJRTWuqhcUJLs8pXJ8PLAYQZtWshFRdkDSDxVvGfwE_LwHawj3ITD1bUH3PXJeZMw6DS-Vx6PO9PmokmRDdSSRu2GqqMjMn9AX9oGlS5UKcP1jhfXDUKh6ZpKuYHb5UeRD_LqkYsvETRVBv5xyUl4JCjwtLrm3j5jr7tpprBmouniukvRMWL5p-s84KT_CMdtzQCnFoemCXwuAfLxIw7_kO9DlEN0rzX1X7NFxLVDux1pno3IoRfYPJvVoWX121LS0EGGsz4');

  async function updateUserPhoto() {
    try {
        spotifyApi.getMyCurrentPlayingTrack().then(
            function(data) {

                http.get(data.body.item.album.images[0].url, function(res) {
                    const file =  api.call('photos.uploadProfilePhoto', {
                        flags: 33561723,
                        file:  res.pipe(fs.createWriteStream('wiki.jpeg'))
                        
                        
                      }); 
                      console.log(file)       
                  });
     
                console.log(data.body.item.album.images[0])
                // const user =  api.call('photos.uploadProfilePhoto', {
                //     flags: 33561723,
                //     file: data.body.item.album.images[0].url + '.jpeg'
                    
                //   });             
                //   console.log(user)
                // return user             
            },
            function(err) {
              console.error(err);
            }
          );
       
    } catch (error) {
        return null
    }
}


async function updateUser() {
    try {
        spotifyApi.getMyCurrentPlayingTrack().then(
            function(data) {
              console.log(data.body.item.album)
                const user =  api.call('account.updateProfile', {
                    flags: 33561723,
                    first_name: `${data.body.item.name} ${data.body.item.album.name}`,
                    
                    about: data.body.item.name
                  });             
               
                return user             
            },
            function(err) {
              console.error(err);
            }
          );
       
    } catch (error) {
        return null
    }
}

async function getUser() {
    try {
      const user = await api.call('users.getFullUser', {
        id: {
          _: 'inputUserSelf',
        },
      });
      
      return user
    } catch (error) {
      return null;
    }
  }
  
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
  
  function checkPassword({ srp_id, A, M1 }) {
    return api.call('auth.checkPassword', {
      password: {
        _: 'inputCheckPasswordSRP',
        srp_id,
        A,
        M1,
      },
    });
  }
  
  const { getSRPParams } = require('@mtproto/core');
  
  const phone = '+996555903140';
  const code = '33868';
  const password = '3776286';
  



  
app.listen(port, () => {
  (async () => {
    
    await updateUser()
    // await updateUserPhoto()
    const user = await getUser();
    if (!user) {
      const { phone_code_hash } = await sendCode(phone);
      try {
        const authResult = await signIn({
          code,
          phone,
          phone_code_hash,
        });
  
        console.log(`authResult:`, authResult);
      } catch (error) {
        if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
          return;
        }
  
        // 2FA
  
        const { srp_id, current_algo, srp_B } = await getPassword();
        const { g, p, salt1, salt2 } = current_algo;
  
        const { A, M1 } = await getSRPParams({
          g,
          p,
          salt1,
          salt2,
          gB: srp_B,
          password,
        });
  
        const authResult = await checkPassword({ srp_id, A, M1 });
  
        console.log(`authResult:`, authResult);
      }
    }
  })();



  console.log(`Example app listening at http://localhost:${port}`)
})