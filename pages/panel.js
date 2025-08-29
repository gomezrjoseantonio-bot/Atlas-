export default function Page(){ return (<>
<header class="header">
  <div class="container nav">
    <div class="logo">
      <div class="logo-mark">
        <div class="bar short"></div>
        <div class="bar mid"></div>
        <div class="bar tall"></div>
      </div>
      <div>ATLAS</div>
    </div>
    <nav class="tabs">
      <a class="tab active" href="/panel">Panel</a>
      <a class="tab " href="/tesoreria">Tesorería</a>
      <a class="tab " href="/inmuebles">Inmuebles</a>
      <a class="tab " href="/documentos">Documentos</a>
      <a class="tab " href="/proyeccion">Proyección</a>
    </nav>
    <div class="actions">
      <span>🔍</span><span>🔔</span><span>⚙️</span>
    </div>
  </div>
</header>

  <main className="container">
    <h2 style={{color:'#092C4F', margin:'16px 0'}}>Panel</h2>
    <div className='grid'><div className='card'>ATLAS · Inmuebles</div><div className='card'>PERSONAL</div></div>
  </main>
</>)}
