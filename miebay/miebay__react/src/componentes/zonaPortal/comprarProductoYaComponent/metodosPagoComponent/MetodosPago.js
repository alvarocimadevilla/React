import './MetodosPago.css'
import { useState, useEffect} from 'react'

function MetodosPago( {modificarPedido} ){

  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    numeroTarjeta: '',
    fechaExpiracion: '',
    cvv: '',
    nombre: '',
    apellidos: ''
  });
    
  useEffect(
    ()=>{
      console.log('en useEffect de metodos pago...valor a meter en pedido: ', { metodoPago: { tipo: paymentMethod, datos: { ...cardDetails} } } );
      modificarPedido( { metodoPago: { tipo: paymentMethod, datos: { ...cardDetails} } } )
    },
    [paymentMethod, modificarPedido, cardDetails]
  )

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);

    // Mostrar el modal cuando se selecciona la opción de tarjeta de crédito
    if (event.target.value === 'creditCard') {
      setShowModal(true);
    }  else {
      setShowModal(false);
    }
  };

  const handleCardDetailChange = (event) => {
    const { name, value } = event.target;
    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));

  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h6>Metodos de pago aceptados</h6>
      </div>
      <div className="card-body">
        {/* Opción de Tarjeta de Crédito */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            value="creditCard"
            id="creditCard"
            defaultChecked={paymentMethod === 'creditCard'}
            onChange={handlePaymentChange}
          />
          <label className="form-check-label" htmlFor="creditCard">
            Tarjeta de crédito o débito
          </label>
        </div>

        {/* Modal para el formulario de tarjeta de crédito */}
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Tarjeta de credito o debito</h6>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col"><p className='text-muted'>El pago es seguro. La informacion de tu tarjeta no se comparte con los vendedores.</p></div>
                </div>

                <div className="row">
                  <div className="col-md-6 form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={cardDetails.numeroTarjeta}
                      onChange={handleCardDetailChange}
                      placeholder="Número de tarjeta"
                    />
                    <label htmlFor="numeroTarjeta" className="form-label text-small">Número de tarjeta</label>

                  </div>
                </div>
                
                <div className="row mt-3">  
                  <div className="col-md-6 form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="fechaExpiracion"
                      name="fechaExpiracion"
                      value={cardDetails.fechaExpiracion}
                      onChange={handleCardDetailChange}
                      placeholder="MM/AA"
                    />
                    <label htmlFor="fechaExpiracion" className="form-label text-small">Fecha de caducidad</label>
                  </div>
                  <div className="col-md-6 form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="cvv"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardDetailChange}
                      placeholder="CVV"
                    />
                    <label htmlFor="cvv" className="form-label text-small">Código de seguridad</label>
                  </div>
                </div>

                <div className="row mt-3">  
                  <div className="col-md-6 form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      name="nombre"
                      value={cardDetails.nombre}
                      onChange={handleCardDetailChange}
                      placeholder="Nombre en la tarjeta"
                    />
                    <label htmlFor="nombre" className="form-label text-small">Nombre</label>
                  </div>
                  <div className="col-md-6 form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="apellidos"
                      name="apellidos"
                      value={cardDetails.apellidos}
                      onChange={handleCardDetailChange}
                      placeholder="Apellido en la tarjeta"
                    />
                    <label htmlFor="apellidos" className="form-label text-small">Apellidos</label>
                  </div>
                </div>

                <div className='row mt-3'>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>
                      <label className="form-check-label" htmlFor="flexCheckDefault">
                        Guardar esta tarjeta para compras futuras
                      </label>
                    </div>
                </div>

                <div className="row mt-3">
                  <div className="col"><strong>Direccion de facturacion</strong></div>
                </div>

                {/* mostrar direccion del cliente cuya propiedad esFacturacion: true */}
                <div className="row">
                  <div className="col">
                      <p className='text-muted'>nombre y apellidos cliente<br/>
                              calle, localidad, provincia cp. Pais
                      </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col"><a href='/'>Modificar la direccion de facturacion</a></div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleModalClose}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleModalClose}>
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Opción de PayPal */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            value="paypal"
            id="paypal"
            defaultChecked={paymentMethod === 'paypal'}
            onChange={handlePaymentChange}
          />
          <label className="form-check-label" htmlFor="paypal">
            PayPal
          </label>
        </div>

        {/* Opción de Google Pay */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            value="googlePay"
            id="googlePay"
            defaultChecked={paymentMethod === 'googlePay'}
            onChange={handlePaymentChange}
          />
          <label className="form-check-label" htmlFor="googlePay">
            Google Pay
          </label>
        </div>
      </div>
    </div>
  );
};

export default MetodosPago;
