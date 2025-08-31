import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function InmuebleDocsRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Redirect to gastos page
      router.replace(`/inmuebles/gastos?property=${id}`);
    } else {
      // Redirect to main inmuebles page
      router.replace('/inmuebles');
    }
  }, [id, router]);

  return (
    <main className="container" style={{ padding: '48px 16px', textAlign: 'center' }}>
      <div style={{ color: 'var(--text-2)' }}>
        <div style={{ marginBottom: '16px' }}>📄</div>
        <div>Redirigiendo a gastos del inmueble...</div>
      </div>
    </main>
  );
}