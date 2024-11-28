/*
modulo de node q va a exportar un objeto JS puro con metodo para enviar emial usando la api de gmail
 1º paso) conectarnos a google con la cuenta de admin creada en gmail para obtener un codigo de acceso una vez autentificados
        y con ese codigo, lo cangeamos por accessToken + refreshToken para usar la api de gmail <--- cliente OAth2


 2º paso) una vez conseguidos los jwt de acceso a la api de gmail, usamos la api para mandar correos

 */
const { google }=require('googleapis');

//1ºpaso crear cliente oauth2 y conseguir jwt de acceso a api de gmail
const oauth2Client=new google.auth.OAuth2(
    process.env.GMAIL_OAUTH_CLIENT_ID, //client_id conexion a oauht2 <----- creado en dashboard de la consola de google cloud, credenciales id-oauth2
    process.env.GMAIL_OAUTH_CLIENT_SECRET, //client_secret conexion a oauth2 <--- creado en dashboard de la consola de google cloud
    'https://developers.google.com/oauthplayground'// url donde google manda codigo para intercambiar por accesstoken y refreshtoken cuando el cliente oauth2 se autentifica bien
);

oauth2Client.setCredentials(
    {
        access_token: process.env.GMAIL_ACCESS_TOKEN,
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
    }
);

const gmailClient=google.gmail( { version:'v1', auth: oauth2Client } );

module.exports={
    EnviarEmail: async function(detallesEmail){
            try {
                console.log('detalles del email a mandar.....', detallesEmail);
                const { nombreCliente='', to, subject, textbody='', htmlbody, attachments=[] }=detallesEmail;
                //2º paso) usando el cliente de gmail mandamos correo usando directamente la api:  metodo .send() exige mandar accesstoken y refreshtoken en cabecera Authorization
                //como parametro del metodo (el cuerpo del mensaje del email): 
                /*
                    { userId: 'me' , 
                      requestBody: {
                                      raw: BASE64(string_email) <--- string_email: 'From: ....\r\n To: .... \r\n Subject: .... \r\n cuerpo del email'
                                    }
                }
                */
                //let _stringEmail=`From: ${proccess.env.ADMIN_GMAIL}\r\nTo: ${to}\r\nContent-Type: text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: ${subject}\r\n\r\n${htmlbody}`;
                let _stringEmail=[
                                `From: ${process.env.ADMIN_GMAIL}`,
                                `To: ${to}`,
                                'Content-Type: text/html;charset=iso-8859-1',
                                'MIME-Version: 1.0',
                                `Subject: ${subject}`,
                                '',
                                `${htmlbody}`
                    ].join('\r\n')
                     .trim();
                
                
                let _emailBASE64=btoa(_stringEmail);

                let _email={ userId:'me', requestBody: { raw: _emailBASE64} };
                let _respuesta=await gmailClient.users.messages.send(_email);
                console.log('respuesta de gmail al envio del correo....', _respuesta);
                
                return true;

            } catch (error) {
                console.log('error en envio del email con api de gmail...', error.message);
                return false;
            }
    }

}