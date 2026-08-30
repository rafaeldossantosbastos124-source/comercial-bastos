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

// Visualizador de fotos em tela cheia (usado no Estoque atual)
function openLightbox(fotos, titulo) {
  let i = 0;
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Fechar">&times;</button>
    ${fotos.length > 1 ? '<button class="lightbox-nav lightbox-prev" aria-label="Foto anterior">&#10094;</button>' : ''}
    <img class="lightbox-img" src="${fotos[0]}" alt="${esc(titulo || '')}">
    ${fotos.length > 1 ? '<button class="lightbox-nav lightbox-next" aria-label="Próxima foto">&#10095;</button>' : ''}
    ${fotos.length > 1 ? `<div class="lightbox-count">1 / ${fotos.length}</div>` : ''}
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const imgEl = overlay.querySelector('.lightbox-img');
  const countEl = overlay.querySelector('.lightbox-count');

  function show(n) {
    i = (n + fotos.length) % fotos.length;
    imgEl.src = fotos[i];
    if (countEl) countEl.textContent = `${i + 1} / ${fotos.length}`;
  }

  function close() {
    document.removeEventListener('keydown', keyHandler);
    document.body.style.overflow = '';
    overlay.remove();
  }

  function keyHandler(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  }

  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  if (fotos.length > 1) {
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => show(i - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => show(i + 1));
  }
  document.addEventListener('keydown', keyHandler);
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

  // Estoque atual
  const estoqueWrap = document.getElementById('estoqueWrap');
  const itensEstoque = data.estoque || [];
  if (itensEstoque.length === 0) {
    estoqueWrap.innerHTML = `<div class="estoque-empty">Nenhum item cadastrado no momento — chama no WhatsApp pra saber o que temos disponível.</div>`;
  } else {
    const statusClasse = s => {
      const v = (s || '').toLowerCase();
      if (v.startsWith('reserv')) return 'reservado';
      if (v.startsWith('vend')) return 'vendido';
      return 'disponivel';
    };
    estoqueWrap.innerHTML = `<div class="estoque-grid">${itensEstoque.map((it, idx) => {
      const fotos = (it.photos || []).map(p => p.src).filter(Boolean);
      const capa = fotos[0] || '';
      const extra = fotos.length - 1;
      return `
      <div class="estoque-card">
        <div class="estoque-thumb" data-item="${idx}">
          ${it.status ? `<span class="estoque-status ${statusClasse(it.status)}">${esc(it.status)}</span>` : ''}
          ${extra > 0 ? `<span class="estoque-count">+${extra} foto${extra > 1 ? 's' : ''}</span>` : ''}
          <img src="${esc(capa)}" alt="${esc(it.nome)}" loading="lazy">
        </div>
        <div class="estoque-body">
          <h3>${esc(it.nome)}</h3>
          ${it.descricao ? `<p>${esc(it.descricao)}</p>` : ''}
        </div>
      </div>
    `;
    }).join('')}</div>`;

    // Abrir galeria de fotos do item ao clicar
    estoqueWrap.querySelectorAll('.estoque-thumb[data-item]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.item, 10);
        const item = itensEstoque[idx];
        const fotos = (item.photos || []).map(p => p.src).filter(Boolean);
        if (fotos.length > 0) openLightbox(fotos, item.nome);
      });
    });
  }

  // Galeria
  document.getElementById('galGrid').innerHTML = data.galeria.map(g => `
    <div class="gal-item">
      <img src="${esc(g.photo)}" alt="${esc(g.caption || 'Foto do pátio Comercial Bastos')}" loading="lazy">
      ${g.caption ? `<span class="gal-cap">${esc(g.caption)}</span>` : ''}
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
