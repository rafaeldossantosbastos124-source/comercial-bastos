// Comercial Bastos — carrega o conteúdo de data.json e monta a página.
// Pra atualizar o site, edite data.json (ou use o painel /admin) — não precisa mexer aqui.

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : str;
  return d.innerHTML;
}

function waLink(number) {
  return `https://wa.me/${number}`;
}

async function init() {
  let data;
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    console.error('Não foi possível carregar data.json', e);
    document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">Não foi possível carregar o conteúdo do site (data.json). Verifique se o arquivo está na mesma pasta do index.html.</p>';
    return;
  }

  // WhatsApp links
  document.querySelectorAll('#navWa, #heroWaBtn, #contatoWaBtn, #floatWa').forEach(el => {
    el.href = waLink(data.hero.whatsapp || data.contato.whatsapp);
  });
  const contatoWaTexto = document.getElementById('contatoWaTexto');
  if (contatoWaTexto) contatoWaTexto.textContent = data.contato.phone;

  // Hero
  document.getElementById('heroEyebrow').textContent = data.hero.eyebrow;
  document.getElementById('heroTitle').innerHTML =
    `${esc(data.hero.titlePlain)} <span>${esc(data.hero.titleHighlight)}</span>`;
  document.getElementById('heroParagraph').textContent = data.hero.paragraph;

  // Ficha técnica
  const npList = document.getElementById('nameplateList');
  npList.innerHTML = data.nameplate.map(row => `
    <li><b>${esc(row.label)}</b><span class="np-val">${esc(row.value)}</span></li>
  `).join('');

  // Sobre
  document.getElementById('sobreEyebrow').textContent = data.sobre.eyebrow;
  document.getElementById('sobreTitle').textContent = data.sobre.title;
  document.getElementById('sobreParagraph').textContent = data.sobre.paragraph;
  document.getElementById('sobreFoto').src = data.sobre.photo;
  document.getElementById('sobreFotoTag').textContent = data.sobre.photoTag;
  document.getElementById('sobreStats').innerHTML = data.sobre.stats.map(s => `
    <div class="stat"><span class="num">${esc(s.num)}</span><span class="lbl">${esc(s.label)}</span></div>
  `).join('');

  // Categorias
  document.getElementById('catGrid').innerHTML = data.categorias.map(c => `
    <div class="cat-card">
      <div class="cat-thumb">
        <span>${esc(c.tag)}</span>
        <img src="${esc(c.photo)}" alt="${esc(c.title)}" loading="lazy">
      </div>
      <div class="cat-body">
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.desc)}</p>
      </div>
    </div>
  `).join('');

  // Galeria
  document.getElementById('galGrid').innerHTML = data.galeria.map(g => `
    <div class="gal-item">
      <img src="${esc(g.photo)}" alt="${esc(g.caption)}" loading="lazy">
      <span class="gal-cap">${esc(g.caption)}</span>
    </div>
  `).join('');

  // Diferenciais
  document.getElementById('difGrid').innerHTML = data.diferenciais.map(d => `
    <div class="dif-plate">
      <span class="n">${esc(d.n)}</span>
      <h3>${esc(d.title)}</h3>
      <p>${esc(d.desc)}</p>
    </div>
  `).join('');

  // Contato
  document.getElementById('contatoEndereco').textContent = data.contato.address;
  document.getElementById('contatoTelefone').textContent = data.contato.phone;
  document.getElementById('contatoHorario').textContent = data.contato.hours;

  // Footer
  document.getElementById('footerLine').textContent = data.footer.line;
  document.getElementById('footerCopy').textContent = data.footer.copyright;

  // Menu mobile
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

init();
