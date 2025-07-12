/*
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX');
</script>
*/
export function loadGA(id: string) {
  if (!id) return;

  // Insert gtag.js script tag
  const scriptExists = document.querySelector(`script[src*="${id}"]`);
  if (scriptExists) { console.log("GA script already exists"); return; }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  // Initialize gtag
  // @ts-ignore
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    // @ts-ignore
    window.dataLayer.push(args);
  }
  // @ts-ignore
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', id);
}

