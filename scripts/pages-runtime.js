/* Static Pages interactions. No API, React hydration, RSC or Sites dependency. */
(() => {
  'use strict';
  const config = JSON.parse(document.querySelector('#pages-config')?.textContent || '{}');
  const base = config.base || '/HEOA/';
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const local = href => href.startsWith('/') && !href.startsWith('//') ? base + href.slice(1) : href;
  document.querySelectorAll('img').forEach(img => {
    const ready = () => {img.closest('.media-frame')?.classList.add('media-ready');};
    if(img.complete)ready();else img.addEventListener('load',ready,{once:true});
  });
  document.querySelectorAll('.language-menu button').forEach(button => button.addEventListener('click',()=>{
    const url = new URL('https://translate.google.com/translate');
    url.searchParams.set('sl','zh-CN');url.searchParams.set('tl',button.lang);url.searchParams.set('u',location.href);location.href=url.href;
  }));
  document.addEventListener('pointerdown',event=>document.querySelectorAll('details[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('details[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary')?.focus();});});
  const team=document.querySelector('.team-filter');
  if(team){const cards=[...document.querySelectorAll('[data-directory="heoa"] > article')];const buttons=[...team.querySelectorAll('button')];buttons.forEach((button,index)=>button.addEventListener('click',()=>{
    let shown=0;cards.forEach(card=>{const role=card.querySelector('.member-meta dd')?.textContent||'';const matches=index===0 || (index===1 ? /博导|博士生导师/ : /硕导|硕士(?:研究)?生导师|博导|博士生导师/).test(role);card.hidden=!matches;shown+=Number(matches);});
    buttons.forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button));});team.querySelector('span[aria-live]').textContent=`显示 ${shown} / ${cards.length} 位`;
  }));}
  document.querySelectorAll('.hero-carousel').forEach(carousel=>{
    const slides=[...carousel.querySelectorAll('.hero-slide')],dots=[...carousel.querySelectorAll('.hero-carousel-dots button')];let active=0,paused=false;
    const show=index=>{active=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===active);slide.setAttribute('aria-hidden',String(i!==active));slide.tabIndex=i===active?0:-1;});dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===active));carousel.querySelector('.hero-carousel-controls span').textContent=`${String(active+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;};
    const buttons=carousel.querySelectorAll('.hero-carousel-controls button');buttons[0]?.addEventListener('click',()=>show(active-1));buttons[1]?.addEventListener('click',()=>show(active+1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
    carousel.addEventListener('focusin',()=>paused=true);carousel.addEventListener('focusout',()=>paused=false);carousel.addEventListener('mouseenter',()=>paused=true);carousel.addEventListener('mouseleave',()=>paused=false);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{const rect=carousel.getBoundingClientRect();if(!paused&&!document.hidden&&rect.bottom>0&&rect.top<innerHeight)show(active+1);},5200);
  });
  function search(entries){const panel=document.querySelector('.site-search-panel'),input=panel.querySelector('input'),list=panel.querySelector('.site-search-results'),count=panel.querySelector('.site-search-count');
    const render=()=>{const q=input.value.trim().toLocaleLowerCase();const results=q?entries.filter(e=>`${e.title} ${e.description} ${e.meta}`.toLocaleLowerCase().includes(q)).slice(0,60):entries.slice(0,12);count.textContent=q?`找到 ${results.length} 条结果`:'输入关键词，或浏览最近内容与成员';list.innerHTML=results.map(e=>`<a class="site-search-result" href="${esc(local(e.href))}"${/^https?:/.test(e.href)?' target="_blank" rel="noopener noreferrer"':''}><span>${esc(e.type)}</span><div><h2>${esc(e.title)}</h2><p>${esc(e.description)}</p><small>${esc(e.meta)}</small></div><span aria-hidden="true">→</span></a>`).join('') || '<div class="site-search-empty">暂未找到匹配内容，请尝试姓名、研究主题或机构简称。</div>';};input.addEventListener('input',render);render();
  }
  function archive(items){const toolbar=document.querySelector('.archive-toolbar'),list=document.querySelector('.archive-list'),selects=toolbar.querySelectorAll('select'),input=toolbar.querySelector('input');let pager=document.querySelector('.archive-pagination');if(!pager){pager=document.createElement('nav');pager.className='archive-pagination';pager.setAttribute('aria-label','资料分页');list.after(pager);}let state={};
    const read=()=>{const p=new URLSearchParams(location.search);state={q:p.get('q')||'',category:p.get('category')||'',year:p.get('year')||'',centerId:p.get('centerId')||'',status:p.get('status')||'all',page:Math.max(1,parseInt(p.get('page'),10)||1),pageSize:[9,12,18].includes(Number(p.get('pageSize')))?Number(p.get('pageSize')):12};};
    const render=()=>{const q=state.q.trim().toLocaleLowerCase();const visible=items.filter(i=>(!state.year||i.date.startsWith(state.year))&&(!state.category||i.category===state.category)&&(!state.centerId||i.centerId===state.centerId)&&(state.status==='all'||!i.status||i.status===state.status)&&(!q||`${i.title} ${i.excerpt} ${i.sourceLabel}`.toLocaleLowerCase().includes(q)));const pages=Math.max(1,Math.ceil(visible.length/state.pageSize));state.page=Math.min(state.page,pages);selects[0].value=state.category||'all';selects[1].value=state.year||'all';selects[2].value=state.pageSize;input.value=state.q;
      toolbar.querySelector('.archive-total').innerHTML=`<strong>${visible.length}</strong><span>项筛选结果</span><small>资料库共 ${items.length} 项 · 第 ${state.page} / ${pages} 页</small>`;
      list.innerHTML=visible.slice((state.page-1)*state.pageSize,state.page*state.pageSize).map(i=>i.html).join('')||'<div class="archive-empty"><strong>暂未找到匹配资料</strong><span>请尝试调整关键词、年份或栏目。</span><button type="button" data-reset>重置筛选</button></div>';list.dataset.page=state.page;list.dataset.pageSize=state.pageSize;list.dataset.query=JSON.stringify(state);
      const start=Math.max(1,Math.min(state.page-2,pages-4));pager.hidden=pages<=1;pager.innerHTML=`<button type="button" data-page="${state.page-1}" aria-label="上一页" ${state.page===1?'disabled':''}>← 上一页</button><div class="archive-page-numbers">${Array.from({length:Math.min(5,pages)},(_,i)=>start+i).map(n=>`<button type="button" data-page="${n}" ${n===state.page?'class="is-current" aria-current="page"':''}>${n}</button>`).join('')}</div><button type="button" data-page="${state.page+1}" aria-label="下一页" ${state.page===pages?'disabled':''}>下一页 →</button>`;
      const p=new URLSearchParams(location.search);for(const [key,value]of Object.entries(state)){const isDefault=value===''||key==='status'&&value==='all'||key==='page'&&value===1||key==='pageSize'&&value===12;if(isDefault)p.delete(key);else p.set(key,value);}history.replaceState(null,'',location.pathname+(p.size?'?'+p:'')+location.hash);
    };
    const update=patch=>{state={...state,...patch,page:1};render();};selects[0].addEventListener('change',()=>update({category:selects[0].value==='all'?'':selects[0].value}));selects[1].addEventListener('change',()=>update({year:selects[1].value==='all'?'':selects[1].value}));selects[2].addEventListener('change',()=>update({pageSize:Number(selects[2].value)}));input.addEventListener('input',()=>update({q:input.value}));const reset=()=>update({q:'',category:'',year:'',centerId:'',status:'all',pageSize:12});toolbar.querySelector('.archive-clear').addEventListener('click',reset);list.addEventListener('click',e=>{if(e.target.closest('[data-reset]'))reset();});pager.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b&&!b.disabled){state.page=Number(b.dataset.page);render();toolbar.scrollIntoView({block:'start'});}});window.addEventListener('popstate',()=>{read();render();});read();render();
  }
  if(config.data)fetch(config.data).then(r=>{if(!r.ok)throw new Error('Static data '+r.status);return r.json();}).then(data=>{if(data.archive)archive(data.archive);if(data.search)search(data.search);document.documentElement.dataset.pagesReady='true';}).catch(error=>{console.error(error);const alert=document.createElement('p');alert.setAttribute('role','alert');alert.textContent='筛选资料加载失败，请刷新页面重试。';document.querySelector('main').prepend(alert);});else document.documentElement.dataset.pagesReady='true';
})();
