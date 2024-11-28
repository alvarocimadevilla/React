import './Direccion.css'

function Direccion( { direc, cuenta } ){
    return (
        <div className="mb-4">
            <h4>Envío a</h4>
            <div className="card">
            <div className="card-header">
                <p className="card-text">
                    <span style={{'fontSize':'1em'}}><strong>{cuenta.nombre} {cuenta.apellidos}</strong> --</span>
                    <span className="text-muted" style={{'fontSize': '0.85em'}}>Datos de contacto: ( email: {cuenta.email}, tflno:{cuenta.telefono} )</span>
                </p>  
            </div>
            <div className="card-body">
                <p className="card-text">{direc.calle}<br/>{direc.municipio}, {direc.provincia} {direc.cp} <br/> {direc.pais}</p>
            </div>
            </div>
        </div>

    );
}

export default Direccion