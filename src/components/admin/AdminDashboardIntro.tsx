import Link from 'next/link'

export const AdminDashboardIntro = () => (
  <section className="medval-admin-intro" aria-labelledby="medval-admin-intro-heading">
    <div className="medval-admin-intro__copy">
      <span className="medval-admin-intro__eyebrow">Medval Supplies</span>
      <h2 id="medval-admin-intro-heading">Tu contenido, en un solo lugar</h2>
      <p>
        Edita los textos y las fotos de la página de inicio, gestiona el catálogo de productos,
        cambia los colores de la marca y revisa las solicitudes recibidas. Los cambios se publican
        en el sitio al pulsar «Publicar cambios».
      </p>
    </div>

    <div className="medval-admin-intro__actions">
      <Link className="medval-admin-intro__card" href="/admin/globals/landing">
        <strong>Editar la página</strong>
        <span>Títulos, textos, especialidades, productos, alianzas y fotos.</span>
      </Link>
      <Link className="medval-admin-intro__card" href="/admin/collections/catalog-items">
        <strong>Gestionar el catálogo</strong>
        <span>Añade, edita o retira productos, fotos y datos farmacéuticos.</span>
      </Link>
      <Link className="medval-admin-intro__card" href="/admin/collections/media">
        <strong>Cambiar imágenes</strong>
        <span>Sube fotos o logos y describe su contenido.</span>
      </Link>
      <Link className="medval-admin-intro__card" href="/admin/globals/site-settings">
        <strong>Colores y marca</strong>
        <span>Ajusta la paleta del sitio y del panel.</span>
      </Link>
      <Link className="medval-admin-intro__card" href="/admin/collections/regions">
        <strong>Datos de contacto</strong>
        <span>Correo, teléfono, WhatsApp y SEO por región.</span>
      </Link>
    </div>

    <a
      className="medval-admin-intro__site"
      href="/es/int"
      rel="noopener noreferrer"
      target="_blank"
    >
      Ver el sitio <span aria-hidden="true">↗</span>
    </a>
  </section>
)
