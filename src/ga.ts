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

  const script1 = document.createElement('script');
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script1.async = true;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `;
  document.head.appendChild(script2);
}

