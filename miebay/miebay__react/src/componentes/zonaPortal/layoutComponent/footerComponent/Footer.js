import { NavLink } from 'react-router-dom';
import './Footer.css'
function Footer(){
    return (
        <footer className="container">
            <div className="footer-sections">
                <div className="footer-column">
                    <h4>Comprar</h4>
                    <ul>
                        <li>Cómo comprar</li>
                        <li>Ofertas de eBay</li>
                        <li>eBay Móvil</li>
                        <li>Eventos</li>
                        <li>Marcas</li>
                        <li>Marcas de coche</li>
                        <li>Tiendas eBay</li>
                        <li>eBay Extra</li>
                        <li>Mapa del sitio</li>
                        <li>Traducciones</li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Vender</h4>
                    <ul>
                        <li>Cómo vender</li>
                        <li>Centro para vendedores</li>
                        <li>Comisiones y tarifas</li>
                        <li>Tiendas eBay</li>
                        <li>Central de envíos</li>
                        <li>Protección del vendedor</li>
                        <li>Ventas internacionales</li>
                        <li>Noticias para vendedores profesionales</li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Contactar con eBay</h4>
                    <ul>
                        <li>La seguridad en eBay</li>
                        <li>Cómo pagar las comisiones y tarifas de eBay</li>
                        <li>Garantía al cliente de eBay</li>
                    </ul>
                </div>

                <div className="footer-column">
                <h4>Acerca de eBay</h4>
                    <ul>
                        <li>Aviso legal</li>
                        <li>Sala de prensa</li>
                        <li>Publicidad en eBay</li>
                        <li>Afiliados</li>
                        <li>Empleo</li>
                        <li>VeRO: Propiedad Intelectual</li>
                        <li>eBay Solidario</li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Comunidad</h4>
                    <ul>
                        <li>Twitter</li>
                        <li>Facebook</li>
                        <li>YouTube</li>
                        <li>Instagram</li>
                        <li>Foro de respuestas</li>
                        <li>Foros de debate</li>
                        <li>Noticias de eBay</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>Copyright © 1995-2024 eBay Inc. Todos los derechos reservados.</p>
                <p>
                    <NavLink to="/Tienda/Productos">Condiciones de uso</NavLink> |
                    <NavLink to="/Tienda/Productos"> Condiciones de los servicios de pago</NavLink> |
                    <NavLink to="/Tienda/Productos"> Privacidad</NavLink> |<NavLink to="/Tienda/Productos"> Cookies</NavLink> |
                    <NavLink to="/Tienda/Productos"> AdChoice</NavLink>
                </p>
                <div className="footer-flag">
                    <img src="/images/spain-flag.png" alt="España" />
                    <span>España</span>
                </div>
            </div>
        </footer>
    );  
}

export default Footer