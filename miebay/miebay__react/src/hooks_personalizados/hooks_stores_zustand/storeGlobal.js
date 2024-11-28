//modulo de codigo para crear store global de zustand
import { create } from 'zustand'

const useGlobalStore=create(
    (set,get,store)=>{
            console.log('parametros funcion pasada al create..', set.toString(), get.toString(), store)
            //el return devuelve el objeto a incorporar en el state-global
            return {
                accessToken: '',
                refreshToken: '',
                cliente: { },
                pedido:{ 
                    comprarYa: {}, 
                    itemsPedido:[],
                    metodoPago: {},
                    subtotal: 0,
                    gastosEnvio: 0,
                    total:0
                },
                setAccessToken: jwt => set( state => ( {accessToken: jwt} ) ),
                setRefreshToken: jwt => set( state => ( { refreshToken: jwt } ) ),
                setPedido: pedido => set( state => ( { ...state, pedido: {...state.pedido, ...pedido } } )),
                setCliente: datoscliente => set(state => ( { ...state, cliente: { ...state.cliente, ...datoscliente } } ))
                }
            }
)

export default useGlobalStore;