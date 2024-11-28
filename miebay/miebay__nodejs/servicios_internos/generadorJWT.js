//el modulo de codigo exporta un objeto JS puro con metodos para generar/validar/refrescar JWT
const jsonwebtoken=require('jsonwebtoken');

module.exports={
    generarJWT: function(payloadJWT, vigenciaJWT, withrefresh=true){
        //vamos a generar dos tipos de tokens, access y refresh
        let _tokens=[
                        { tipo: 'accessToken', expiresIn: vigenciaJWT },
                        { tipo: 'refreshToken', expiresIn: '5h' }
                    ].map(
                        (el,pos,arr)=> {
                            let _payload= el.tipo==='accessToken' ? { tipo: el.tipo, ...payloadJWT }: { tipo: el.tipo, email: payloadJWT.email }
                            return jsonwebtoken.sign(
                                _payload,
                                process.env.FIRMA_JWT_SECRETKEY,
                                { issuer: 'http://localhost:3000', expiresIn: el.expiresIn }
                            );    
                        }
                    );

        return withrefresh ? _tokens : _tokens[0]; //<---- array con accessJWT y refreshJWT si quiero ambos con el parametro withrefresh=true, sino solo devuelvo el accessToken
                                                   //   para tokens de un solo uso
    },
    // generarJWTUnsoloUso: function(payloadJWT){ <------ aprovecho metodo de arriba, implementarlo si quereis para practicar...

    // },
    verificarJWT: function(jwt){
        //el metodo .verify devuelve el payload del jwt siempre y cuando no haya expirado el jwt y sea valido (firmado por el servicio), sino lanza excepcion
        // 'invalid token' <---- firma invalida o origen invalido
        // 'jwt expired' <------- jwt expirado
        try {
            let _payloadJWT=jsonwebtoken.verify(jwt, process.env.FIRMA_JWT_SECRETKEY);
            console.log('datos del jwt...', _payloadJWT);

            return _payloadJWT;
            
        } catch (error) {
            console.log('TOKEN INVALIDO ya sea por expiracion o origen/firma incorrectos...', error.message);
            if(error.message==='jwt expired'){
                    //hacer uso del refresh token para volver a generar accessJWT
                    return { estadoToken: 'invalido', accion: 'regeneraAccessJWT'};
            } else {
                    return { estadoToken: 'invalido', accion: 'volverLogin'};
            }
        }
    }
}

