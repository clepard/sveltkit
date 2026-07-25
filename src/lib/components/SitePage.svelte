<script lang="ts">
	import { provideBuilder, type BuilderImage } from '$lib/builder/context';
	import EditImage from '$lib/builder/EditImage.svelte';
	import EditSurface from '$lib/builder/EditSurface.svelte';
	import EditText from '$lib/builder/EditText.svelte';
	import type { PageDocument, SurfaceColors } from '$lib/server/db/schema';

	let {
		document, images = [], editing = false,
		registerText = () => {}, registerImage = () => {}, registerSurface = () => {},
		onEditImage = () => {}, onEditColors = () => {}
	} = $props<{
		document: PageDocument; images?: BuilderImage[]; editing?: boolean;
		registerText?: (id: string, fallback: string) => void;
		registerImage?: (id: string) => void;
		registerSurface?: (id: string, defaults: SurfaceColors) => void;
		onEditImage?: (id: string, label: string) => void;
		onEditColors?: (id: string, label: string) => void;
	}>();

	provideBuilder({
		get document() { return document; },
		get images() { return images; },
		get editing() { return editing; },
		registerText: (id, fallback) => registerText(id, fallback),
		registerImage: (id) => registerImage(id),
		registerSurface: (id, defaults) => registerSurface(id, defaults),
		openImage: (id, label) => onEditImage(id, label),
		openColors: (id, label) => onEditColors(id, label)
	});

	let menuOpen = $state(false);
	const training = [
		{ title: 'Riedlenčių treniruotės', image: '/images/persimonas/hero.webp', tag: 'Riedlentės' },
		{ title: 'Paspirtukų treniruotės', image: '/images/persimonas/scooter-training.webp', tag: 'Paspirtukai' },
		{ title: 'BMX treniruotės', image: '/images/persimonas/community.webp', tag: 'BMX' },
		{ title: 'Riedučių treniruotės', image: '/images/persimonas/services.webp', tag: 'Riedučiai' }
	];
	const services = [
		{ title: 'Tavo gimtadienis AJE+ Skateparke', copy: 'Mėgaukitės geriausiu laiku skateparke kartu su draugais.', tone: 'yellow', label: 'Populiaru!' },
		{ title: 'Erdvės renginiams', copy: 'Patalpa ir įranga jūsų renginiams.', tone: 'purple', label: 'Renginiai' },
		{ title: 'Kultūros edukacija', copy: 'Pamokos moksleiviams 7–12 klasėms.', tone: 'green', label: 'Edukacija' },
		{ title: 'Įrangos parduotuvė', copy: 'Veikloms skirtos įrangos parduotuvėlė.', tone: 'blue', label: 'Parduotuvė' }
	];

	function closeMenu() { menuOpen = false; }
</script>

<div class="skate-site">
	<section class="hero" id="pradzia">
		<EditImage id="skate.hero.image" label="hero background" class="hero-media">
			{#snippet fallback()}<img src="/images/persimonas/skate-training.webp" alt="AJE+ uždaras riedėjimo parkas Klaipėdoje" />{/snippet}
		</EditImage>
		<div class="hero-shade"></div>

		<header class="site-header">
			<a class="logo" href="#pradzia" aria-label="AJE+ Skatepark pradžia" onclick={closeMenu}>
				<span class="logo-mark">AJE</span><span>+SKATEPARK</span>
			</a>
			<button class="menu-toggle" type="button" aria-label="Atverti meniu" aria-expanded={menuOpen} onclick={() => menuOpen = !menuOpen}>
				<span></span><span></span>
			</button>
			<nav class:open={menuOpen} aria-label="Pagrindinė navigacija">
				<a href="#treniruotes" onclick={closeMenu}>Treniruotės <span>⌄</span></a>
				<a href="#paslaugos" onclick={closeMenu}>Gimtadieniai</a>
				<a href="#paslaugos" onclick={closeMenu}>Erdvės renginiams</a>
				<a href="#stovyklos" onclick={closeMenu}>Stovyklos</a>
				<a href="#renginiai" onclick={closeMenu}>Renginiai</a>
				<a href="#apie" onclick={closeMenu}>Apie <span>⌄</span></a>
			</nav>
			<div class="header-actions">
				<a class="schedule-button" href="#tvarkarastis"><span class="calendar">▦</span> Veiklų tvarkaraštis</a>
				<a class="contact-button" href="#kontaktai">Susisiekti</a>
			</div>
		</header>

		<div class="hero-content">
			<EditText id="skate.hero.headline" as="h1" fallback="Pirmas uždaras riedėjimo parkas Klaipėdoje" multiline={true} />
			<EditText id="skate.hero.intro" as="p" fallback="Tai vieta aktyviai veiklai, kūrybai ir saviraiškai, kur gimsta idėjos, stiprėja bendruomenė ir kiekvienas gali drąsiai išreikšti save." multiline={true} />
			<div class="hero-buttons">
				<a class="button primary" href="#treniruotes">Treniruotės su instruktoriumi <span>›</span></a>
				<a class="button light" href="#tvarkarastis">Atviros sesijos <span>→</span></a>
			</div>
		</div>
	</section>

	<main>
		<EditSurface id="training" label="Treniruotės" class="training-section" background="#f1eee6" text="#050505">
			<div class="white-panel" id="treniruotes">
				<div class="section-intro">
					<div>
						<span class="eyebrow">Treniruotės</span>
						<EditText id="skate.training.headline" as="h2" fallback="Treniruotės su instruktoriumi" multiline={true} />
					</div>
					<EditText id="skate.training.intro" as="p" fallback="Pradėti gali kiekvienas. Mokomės saugiai, nuosekliai ir savo tempu — grupėje arba individualiai." multiline={true} />
				</div>
				<div class="training-grid">
					{#each training as item, index}
						<article class="training-card">
							<EditImage id={`skate.training.image.${index}`} label={item.title} class="training-image">
								{#snippet fallback()}<img src={item.image} alt={item.title} />{/snippet}
							</EditImage>
							<div class="image-gradient"></div>
							<span class="card-tag">{item.tag}</span>
							<div class="training-copy">
								<h3>{item.title}</h3>
								<a href="#kontaktai">Plačiau <span>↗</span></a>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</EditSurface>

		<section class="sessions-section" id="tvarkarastis">
			<div class="sessions-photo">
				<EditImage id="skate.sessions.image" label="open riding session" class="sessions-image">
					{#snippet fallback()}<img src="/images/persimonas/open-session.webp" alt="Atvira riedėjimo sesija" />{/snippet}
				</EditImage>
			</div>
			<div class="sessions-copy">
				<span class="eyebrow light-eyebrow">Atviros sesijos</span>
				<EditText id="skate.sessions.headline" as="h2" fallback="Atviros riedėjimo sesijos" multiline={true} />
				<EditText id="skate.sessions.intro" as="p" fallback="Atvyk, kai parkas atviras laisvam riedėjimui! Laisvas laikas, judėjimas ir bendraminčių bendruomenė – kiekvieną savaitę." multiline={true} />
				<ul>
					<li><span>✓</span> Nemokamos sesijos nuo 1 iki 2,5 val.</li>
					<li><span>✓</span> Tinka riedlentininkams, paspirtukininkams, in-line ir BMX rideriams</li>
					<li><span>✓</span> Vyksta kiekvieną savaitę pagal tvarkaraštį</li>
				</ul>
				<a class="button yellow" href="#renginiai">Tvarkaraštis <span>→</span></a>
			</div>
		</section>

		<EditSurface id="services" label="Kitos paslaugos" class="services-section" background="#ffffff" text="#050505">
			<div class="content-width" id="paslaugos">
				<div class="section-intro service-heading">
					<div>
						<span class="eyebrow">Daugiau galimybių</span>
						<EditText id="skate.services.headline" as="h2" fallback="Kitos paslaugos" />
					</div>
					<EditText id="skate.services.intro" as="p" fallback="Skateparkas gali tapti tavo šventės, renginio, pamokos ar tiesiog gero susitikimo vieta." multiline={true} />
				</div>
				<div class="service-grid">
					{#each services as service, index}
						<article class:yellow-card={service.tone === 'yellow'} class:purple-card={service.tone === 'purple'} class:green-card={service.tone === 'green'} class:blue-card={service.tone === 'blue'}>
							<span class="service-number">0{index + 1}</span>
							<span class="pill">{service.label}</span>
							<h3>{service.title}</h3>
							<p>{service.copy}</p>
							<a href="#kontaktai" aria-label={`Plačiau apie ${service.title}`}>↗</a>
						</article>
					{/each}
				</div>
			</div>
		</EditSurface>

		<section class="camp-section" id="stovyklos">
			<div class="camp-heading">
				<span class="eyebrow">Vasaros stovyklos</span>
				<EditText id="skate.camp.headline" as="h2" fallback="SKATE CAMP" />
				<p>Judėjimas, nauji draugai ir vasara ant ratų.</p>
			</div>
			<div class="camp-card">
				<img src="/images/persimonas/camp.webp" alt="Skate camp" />
				<div>
					<span>Birž. 17 d.</span>
					<h3>Savaitė, kurią prisiminsi</h3>
					<p>Penkių dienų stovykla jaunimui su treniruotėmis, žaidimais ir kūrybinėmis veiklomis.</p>
					<a class="button primary" href="#kontaktai">Sužinoti daugiau <span>→</span></a>
				</div>
			</div>
		</section>

		<section class="events-section" id="renginiai">
			<div class="content-width">
				<div class="events-top">
					<div><span class="eyebrow">Kas vyksta parke</span><h2>Renginiai</h2></div>
					<a href="#kontaktai">Visi renginiai <span>↗</span></a>
				</div>
				<div class="events-grid">
					{#each ['Filmų vakaras', 'Game of Skate', 'Atvira BMX sesija'] as event, index}
						<article>
							<div class="event-date"><strong>{index === 0 ? '30' : index === 1 ? '08' : '15'}</strong><span>{index === 0 ? 'SAU' : 'VAS'}</span></div>
							<div><span class="event-label">{index === 0 ? 'Nemokamai' : 'Registracija'}</span><h3>{event}</h3><p>18:00 · AJE+ Skatepark, Gluosnių skg. 2a-k2</p></div>
							<span class="event-arrow">↗</span>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<section class="about-section" id="apie">
			<div>
				<span class="eyebrow">Apie mus</span>
				<EditText id="skate.about.headline" as="h2" fallback="Daugiau nei skateparkas" multiline={true} />
			</div>
			<div class="about-copy">
				<EditText id="skate.about.intro" as="p" fallback="Siekiame sukurti erdvę, kur žmonės gali judėti, kurti ir augti kartu. Čia gimsta idėjos, stiprėja bendruomenė ir kiekvienas gali drąsiai išreikšti save." multiline={true} />
				<a class="button light" href="#kontaktai">Susisiekti <span>→</span></a>
			</div>
		</section>
	</main>

	<footer id="kontaktai">
		<div class="footer-top">
			<h2>Kaip mus rasti?</h2>
			<a class="map-card" href="https://maps.google.com/?q=Gluosnių+skg.+2a-k2,+Klaipėda" target="_blank" rel="noreferrer">
				<div class="map-grid"></div><span>Gluosnių skg. 2a-k2<br />Klaipėda, 91250</span><b>Atidaryti žemėlapį ↗</b>
			</a>
		</div>
		<div class="footer-grid">
			<div class="footer-brand"><span class="logo-mark">AJE</span><small>+ SKATEPARK</small></div>
			<div><span class="footer-label">Apie mus</span><p>Asmenybės ugdymo kultūros centras, VšĮ</p><p>Gluosnių skg. 2a-k2, Klaipėda</p></div>
			<div><span class="footer-label">Telefonas</span><a href="tel:+37065183405">+370 651 83405</a><span class="footer-label second">El. paštas</span><a href="mailto:ajeskatepark@gmail.com">ajeskatepark@gmail.com</a></div>
			<div><span class="footer-label">Sekite mus</span><a href="https://www.facebook.com/ajeskatepark">Facebook ↗</a></div>
		</div>
		<div class="copyright">Visos teisės saugomos © 2026 – AJE+ Skatepark</div>
	</footer>
</div>

<style>
	@font-face{font-family:Lexend;src:url('/fonts/lexend.woff2') format('woff2');font-weight:100 900;font-display:swap}
	.skate-site{--purple:#6b20ce;--yellow:#f8d641;--cream:#f1eee6;--ink:#080808;width:100%;overflow:hidden;background:var(--cream);color:var(--ink);font-family:Lexend,Arial,sans-serif}
	.hero{position:relative;min-height:900px;color:#fff;isolation:isolate}
	:global(.hero-media){position:absolute;inset:0;z-index:-3;width:100%;height:100%}:global(.hero-media img){display:block;width:100%;height:100%;object-fit:cover;object-position:center 42%}.hero-shade{position:absolute;inset:0;z-index:-2;background:linear-gradient(90deg,rgba(0,0,0,.89) 0%,rgba(0,0,0,.48) 38%,rgba(0,0,0,.04) 76%)}
	.site-header{position:absolute;z-index:4;top:20px;left:50%;display:flex;width:calc(100% - 160px);max-width:1280px;height:96px;align-items:center;gap:35px;padding:0 24px;border-radius:17px;background:#fff;color:#141414;transform:translateX(-50%);box-shadow:0 8px 25px #00000010}
	.logo{display:flex;min-width:62px;flex-direction:column;color:var(--purple);text-decoration:none;font-size:7px;font-weight:700;line-height:1}.logo-mark{font-size:24px;font-weight:300;letter-spacing:.04em}.site-header nav{display:flex;align-items:center;gap:28px;white-space:nowrap}.site-header nav a{font-size:13px;font-weight:650;text-decoration:none}.site-header nav span{margin-left:5px;font-size:16px}.header-actions{display:flex;flex:none;margin-left:auto;gap:18px}.schedule-button,.contact-button{display:flex;height:42px;flex:none;align-items:center;justify-content:center;border-radius:13px;text-decoration:none;font-size:12px;font-weight:720}.schedule-button{width:190px;gap:11px;background:var(--yellow)}.calendar{font-size:22px}.contact-button{width:95px;border:1px solid #e3be1d}.menu-toggle{display:none}
	.hero-content{position:absolute;left:max(80px,calc((100% - 1280px)/2));top:136px;width:510px}.hero-content :global(h1){margin:0;font-size:clamp(72px,6.7vw,96px);font-weight:720;letter-spacing:-.075em;line-height:.99;text-wrap:balance}.hero-content>:global(p){max-width:500px;margin:36px 0 38px;font-size:14px;line-height:1.45}.hero-buttons{display:flex;gap:20px}.button{display:inline-flex;min-height:39px;align-items:center;justify-content:space-between;gap:24px;border-radius:12px;padding:0 18px;text-decoration:none;font-size:13px;font-weight:700}.button.primary{background:var(--purple);color:#fff}.button.light{border:1px solid #e0bd21;background:#fff;color:#111}.button.yellow{background:var(--yellow);color:#111}
	:global(.training-section){padding:40px 80px 90px}.white-panel{max-width:1280px;margin:auto;border-radius:17px;background:#fff;padding:50px 45px 55px}.section-intro{display:grid;grid-template-columns:1.25fr .75fr;gap:50px;align-items:end;margin-bottom:36px}.eyebrow{display:block;margin-bottom:17px;color:#5e6673;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.section-intro :global(h2),.camp-heading :global(h2),.events-top h2,.about-section :global(h2),.footer-top h2{margin:0;font-size:clamp(48px,5vw,72px);font-weight:720;letter-spacing:-.065em;line-height:.98}.section-intro>:global(p){max-width:480px;margin:0 0 5px;font-size:16px;line-height:1.55;color:#58606b}
	.training-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.training-card{position:relative;min-height:380px;overflow:hidden;border-radius:15px;color:#fff}.training-card :global(.training-image){position:absolute;inset:0;width:100%;height:100%}.training-card :global(.training-image img){width:100%;height:100%;object-fit:cover}.image-gradient{position:absolute;inset:0;background:linear-gradient(180deg,#0001 35%,#000c)}.card-tag{position:absolute;top:15px;left:15px;padding:7px 10px;border-radius:20px;background:#fff;color:#111;font-size:10px;font-weight:700}.training-copy{position:absolute;right:18px;bottom:18px;left:18px}.training-copy h3{margin:0 0 17px;font-size:23px;letter-spacing:-.045em;line-height:1.05}.training-copy a{display:flex;align-items:center;justify-content:space-between;color:#fff;text-decoration:none;font-size:12px;font-weight:650}.training-copy a span{font-size:20px}
	.sessions-section{display:grid;grid-template-columns:1.16fr .84fr;min-height:650px;background:#19151f;color:#fff}.sessions-photo,.sessions-photo :global(.sessions-image){height:100%;min-height:650px}.sessions-photo :global(img){display:block;width:100%;height:100%;object-fit:cover}.sessions-copy{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:80px clamp(40px,6vw,95px);background:var(--purple)}.light-eyebrow{color:#e6d2ff}.sessions-copy :global(h2){max-width:520px;margin:0;font-size:clamp(48px,5vw,70px);letter-spacing:-.07em;line-height:.98}.sessions-copy>:global(p){max-width:510px;margin:28px 0 22px;font-size:15px;line-height:1.55}.sessions-copy ul{display:grid;gap:15px;margin:0 0 34px;padding:0;list-style:none;font-size:13px;line-height:1.4}.sessions-copy li{display:flex;gap:12px}.sessions-copy li span{display:grid;width:22px;height:22px;flex:none;place-items:center;border-radius:50%;background:var(--yellow);color:#111;font-weight:800}
	:global(.services-section){padding:100px 80px}.content-width{max-width:1280px;margin:auto}.service-heading{margin-bottom:46px}.service-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.service-grid article{position:relative;display:flex;min-height:380px;flex-direction:column;padding:25px;border-radius:17px}.yellow-card{background:var(--yellow)}.purple-card{background:#8a58d5;color:#fff}.green-card{background:#a8ce62}.blue-card{background:#d6e6ff}.service-number{font-size:12px;font-weight:750}.pill{align-self:flex-start;margin-top:22px;border:1px solid currentColor;border-radius:25px;padding:7px 10px;font-size:10px}.service-grid h3{margin:auto 0 15px;font-size:28px;letter-spacing:-.055em;line-height:1.02}.service-grid p{min-height:44px;margin:0;opacity:.75;font-size:12px;line-height:1.45}.service-grid article>a{display:grid;width:42px;height:42px;place-items:center;align-self:flex-end;margin-top:25px;border-radius:50%;background:#fff;color:#111;text-decoration:none;font-size:18px}
	.camp-section{display:grid;grid-template-columns:.82fr 1.18fr;gap:80px;padding:105px max(80px,calc((100% - 1280px)/2));background:var(--yellow)}.camp-heading{align-self:center}.camp-heading>p{max-width:420px;font-size:17px;line-height:1.5}.camp-card{display:grid;grid-template-columns:230px 1fr;overflow:hidden;border-radius:18px;background:#fff}.camp-card>img{width:100%;height:100%;object-fit:cover}.camp-card>div{display:flex;flex-direction:column;padding:34px}.camp-card>div>span{font-size:11px;font-weight:700;text-transform:uppercase}.camp-card h3{margin:auto 0 12px;font-size:36px;letter-spacing:-.055em;line-height:1}.camp-card p{margin:0 0 24px;color:#626873;font-size:13px;line-height:1.5}.camp-card .button{align-self:flex-start}
	.events-section{padding:100px 80px;background:#151317;color:#fff}.events-top{display:flex;align-items:end;justify-content:space-between;margin-bottom:45px}.events-top .eyebrow{color:#aaa3b0}.events-top>a{color:#fff;font-size:13px;text-decoration:none}.events-grid{border-top:1px solid #ffffff35}.events-grid article{display:grid;grid-template-columns:120px 1fr auto;align-items:center;gap:30px;padding:28px 0;border-bottom:1px solid #ffffff35}.event-date{display:flex;align-items:baseline;gap:8px}.event-date strong{font-size:46px}.event-date span,.event-label{font-size:10px;font-weight:700;text-transform:uppercase}.event-label{color:#e0c7ff}.events-grid h3{margin:6px 0;font-size:25px;letter-spacing:-.04em}.events-grid p{margin:0;color:#aaa3b0;font-size:12px}.event-arrow{font-size:28px}
	.about-section{display:grid;grid-template-columns:1fr 1fr;gap:80px;padding:110px max(80px,calc((100% - 1280px)/2));background:#dfeafb}.about-copy{align-self:end}.about-copy>:global(p){max-width:590px;margin:0 0 30px;font-size:19px;line-height:1.5}.about-copy .light{border-color:#111}
	footer{padding:100px max(80px,calc((100% - 1280px)/2)) 25px;background:#fff;color:#141414}.footer-top{display:grid;grid-template-columns:.7fr 1.3fr;gap:70px;align-items:start}.map-card{position:relative;display:flex;min-height:250px;flex-direction:column;justify-content:space-between;overflow:hidden;border-radius:17px;background:#e7e9ef;padding:28px;color:#111;text-decoration:none}.map-grid{position:absolute;inset:0;opacity:.32;background-image:linear-gradient(#768397 1px,transparent 1px),linear-gradient(90deg,#768397 1px,transparent 1px);background-size:38px 38px;transform:rotate(-8deg) scale(1.2)}.map-card span,.map-card b{position:relative}.map-card span{font-size:24px;font-weight:680;letter-spacing:-.04em}.map-card b{align-self:flex-end;font-size:12px}.footer-grid{display:grid;grid-template-columns:1.2fr 1.4fr 1.2fr .7fr;gap:45px;margin-top:75px;padding:45px 0;border-top:1px solid #d6d6d6}.footer-brand{display:flex;flex-direction:column;color:var(--purple)}.footer-brand .logo-mark{font-size:54px}.footer-brand small{font-weight:750}.footer-label{display:block;margin-bottom:13px;color:#7b818a;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.footer-label.second{margin-top:25px}.footer-grid p,.footer-grid a{display:block;margin:0 0 10px;font-size:13px;line-height:1.5;text-decoration:none}.copyright{padding-top:22px;border-top:1px solid #d6d6d6;color:#747982;font-size:10px}
	@media(max-width:1180px){.site-header{width:calc(100% - 48px)}.site-header nav{gap:16px}.site-header nav a{font-size:11px}.schedule-button{padding:0 12px}.training-grid,.service-grid{grid-template-columns:repeat(2,1fr)}.training-card{min-height:430px}.service-grid article{min-height:300px}}
	@media(max-width:820px){.hero{min-height:760px}.site-header{top:12px;height:74px;padding:0 18px}.menu-toggle{display:flex;width:38px;height:38px;flex-direction:column;justify-content:center;gap:6px;margin-left:auto;border:0;background:transparent}.menu-toggle span{display:block;width:24px;height:2px;background:#111}.site-header nav{position:absolute;top:84px;right:0;left:0;display:none;flex-direction:column;align-items:flex-start;gap:0;border-radius:14px;background:#fff;padding:14px}.site-header nav.open{display:flex}.site-header nav a{width:100%;padding:12px;font-size:13px}.header-actions{display:none}.hero-content{top:150px;right:25px;left:25px;width:auto}.hero-content :global(h1){max-width:570px;font-size:clamp(52px,13vw,78px)}.hero-content>:global(p){margin:28px 0}.hero-buttons{flex-direction:column;align-items:flex-start}:global(.training-section),:global(.services-section),.events-section{padding:50px 20px}.white-panel{padding:34px 20px}.section-intro,.camp-section,.about-section,.footer-top{grid-template-columns:1fr;gap:30px}.section-intro>:global(p){font-size:14px}.training-grid,.service-grid{grid-template-columns:1fr 1fr}.sessions-section{grid-template-columns:1fr}.sessions-photo,.sessions-photo :global(.sessions-image){min-height:410px}.sessions-copy{padding:55px 25px}.camp-section,.about-section,footer{padding:65px 25px}.camp-card{grid-template-columns:1fr}.camp-card>img{height:300px}.events-grid article{grid-template-columns:75px 1fr}.event-arrow{display:none}.footer-grid{grid-template-columns:1fr 1fr}}
	@media(max-width:520px){.site-header{width:calc(100% - 24px)}.hero{min-height:720px}.hero-content{top:135px;left:18px}.hero-content :global(h1){font-size:53px}.hero-content>:global(p){font-size:13px}.button{font-size:12px}.training-grid,.service-grid{grid-template-columns:1fr}.training-card{min-height:390px}.section-intro :global(h2),.camp-heading :global(h2),.events-top h2,.about-section :global(h2),.footer-top h2{font-size:45px}.service-grid article{min-height:310px}.camp-card>div{padding:25px}.events-top{align-items:start;flex-direction:column;gap:20px}.events-grid article{grid-template-columns:60px 1fr;gap:15px}.event-date strong{font-size:35px}.footer-grid{grid-template-columns:1fr}.footer-brand .logo-mark{font-size:46px}}
</style>
