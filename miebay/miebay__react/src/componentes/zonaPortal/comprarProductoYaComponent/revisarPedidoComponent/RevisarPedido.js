import './RevisarPedido.css'

import { useState,useEffect } from 'react';

function RevisarPedido( { itemPedido, modificarPedido } ){

    const { producto, cantidad }=itemPedido;
    const [ cantidadProd, setCantidadProd]=useState(cantidad);
    
    useEffect(
      ()=>{
        modificarPedido(
          {
            comprarYa:{ producto, cantidad: cantidadProd },
            subtotal: cantidadProd * producto.precio,
            gastosEnvio: 0,
            total: (cantidadProd * producto.precio ) + 0//<---habria q sumar gastos envio
          }
        );
      },[cantidadProd, modificarPedido, producto]
    )
    
    return (
        <div className="card mb-4">
          <div className="card-header">
            {/* Nombre del Vendedor */}
            <p className="card-text"><strong>Vendedor:</strong> {producto.idVendedor } {'  '} <a href="/">Añadir nota para el vendedor</a></p>
          </div>

          <div className="card-body d-flex flex-row">
            {/* Imagen del Producto */}
            <div className="col-md-2 p-2">
              <img 
                  src={producto.imagenes[0] ||"https://via.placeholder.com/100"} // Placeholder de ejemplo; reemplázalo con la URL real de la imagen del producto
                  alt="Producto"
                  className="img-thumbnail"
                  style={{ width: '100px' }}
                />
            </div>

            <div className="col-md-10 p-3">
                {/* Nombre del Producto */}
                <p className='card-text'><strong>{producto.nombre}</strong><br/><span className="text-muted">Estado: {producto.estado}</span></p>
                
                {/* Precio del Producto */}
                <p className='card-text '><strong>{producto.precio} EUR</strong> </p>

                {/* Dropdown de Cantidad */}
                <div className="form-floating mb-3" style={ {width:'135px'} }>
                <select
                    id="quantity"
                    className="form-control  form-select"
                    value={cantidad}
                    onChange={(e) => setCantidadProd( parseInt(e.target.value))}
                  >
                    {
                      Array.from({length:10}, (_,i) => i+1)
                          .map((num) => (
                                          <option key={num} value={num}>{num}</option>
                                         )
                              )
                    }
                  </select>

                  <label htmlFor="quantity" className="form-label"><strong>Cantidad:</strong></label>
                </div>

                {/* Métodos de Envío */}
                <div className="mb-3">
                  <h6><strong>Envío:</strong></h6>
                  <span className='text-mutted'>{producto.envio.tiempoEstimado}</span>
                  {
                    producto.envio.compania.map(
                      (envio,pos) => (
                        <div className="form-check" key={pos}>
                          <input
                              className="form-check-input"
                              type="radio"
                              name={envio}
                              value={envio}
                              id={`id-${envio}`}
                              defaultChecked={pos === 0}
    //                        onChange={(e) => setShippingMethod(e.target.value)}
                          />
                          <label className="form-check-label" htmlFor={`id-${envio}`}>
                            {envio} (0,00 EUR)
                          </label>
                      </div>
        
                      )
                    )
                  }
                </div>


            </div>
    
    
    
    
          </div>
        </div>
      );
}

export default RevisarPedido;