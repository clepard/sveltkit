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
		{ title: 'Tavo gimtadienis AJE+ Skateparke', copy: 'Mėgaukitės geriausiu laiku skateparke kartu su draugais.', tone: 'yellow', label: 'Populiaru!', background: '#f8d641', text: '#050505' },
		{ title: 'Erdvės renginiams', copy: 'Patalpa ir įranga jūsų renginiams.', tone: 'purple', label: 'Renginiai', background: '#8a58d5', text: '#ffffff' },
		{ title: 'Kultūros edukacija', copy: 'Pamokos moksleiviams 7–12 klasėms.', tone: 'green', label: 'Edukacija', background: '#a8ce62', text: '#050505' },
		{ title: 'Įrangos parduotuvė', copy: 'Veikloms skirtos įrangos parduotuvėlė.', tone: 'blue', label: 'Parduotuvė', background: '#d6e6ff', text: '#050505' }
	];
	const events = [
		{ day: '30', month: 'SAU', label: 'Nemokamai', title: 'Filmų vakaras' },
		{ day: '08', month: 'VAS', label: 'Registracija', title: 'Game of Skate' },
		{ day: '15', month: 'VAS', label: 'Registracija', title: 'Atvira BMX sesija' }
	];

	function closeMenu() { menuOpen = false; }
	function keepEditorLinksInPlace(event: MouseEvent) {
		if (editing && event.target instanceof Element && event.target.closest('.skate-site a')) event.preventDefault();
	}
</script>

<svelte:window onclick={keepEditorLinksInPlace} />

<div class="skate-site">
	<EditSurface id="skate.surface.hero" label="Hero" class="hero" background="#171417" text="#ffffff">
		<span id="pradzia" class="anchor-target"></span>
		<EditImage id="skate.hero.image" label="hero background" class="hero-media">
			{#snippet fallback()}<img src="/images/persimonas/skate-training.webp" alt="AJE+ uždaras riedėjimo parkas Klaipėdoje" />{/snippet}
		</EditImage>
		<div class="hero-shade"></div>
		{#if editing}
			<button type="button" class="hero-image-control" onclick={() => onEditImage('skate.hero.image', 'hero background')}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/></svg>
				Change background image
			</button>
		{/if}

		<EditSurface id="skate.surface.header" label="Navigation" as="header" class="site-header" background="#ffffff" text="#141414">
			<a class="logo" href="#pradzia" aria-label="AJE+ Skatepark pradžia" onclick={closeMenu}>
				<EditText id="skate.logo.main" fallback="AJE" class="logo-mark" />
				<EditText id="skate.logo.sub" fallback="+SKATEPARK" />
			</a>
			<button class="menu-toggle" type="button" aria-label="Atverti meniu" aria-expanded={menuOpen} onclick={() => menuOpen = !menuOpen}>
				<span></span><span></span>
			</button>
			<nav class:open={menuOpen} aria-label="Pagrindinė navigacija">
				<a href="#treniruotes" onclick={closeMenu}><EditText id="skate.nav.training" fallback="Treniruotės" /> <span class="nav-chevron">⌄</span></a>
				<a href="#paslaugos" onclick={closeMenu}><EditText id="skate.nav.birthdays" fallback="Gimtadieniai" /></a>
				<a href="#paslaugos" onclick={closeMenu}><EditText id="skate.nav.eventsSpace" fallback="Erdvės renginiams" /></a>
				<a href="#stovyklos" onclick={closeMenu}><EditText id="skate.nav.camps" fallback="Stovyklos" /></a>
				<a href="#renginiai" onclick={closeMenu}><EditText id="skate.nav.events" fallback="Renginiai" /></a>
				<a href="#apie" onclick={closeMenu}><EditText id="skate.nav.about" fallback="Apie" /> <span class="nav-chevron">⌄</span></a>
			</nav>
			<div class="header-actions">
				<a class="schedule-button" href="#tvarkarastis"><span class="calendar">▦</span><EditText id="skate.nav.schedule" fallback="Veiklų tvarkaraštis" /></a>
				<a class="contact-button" href="#kontaktai"><EditText id="skate.nav.contact" fallback="Susisiekti" /></a>
			</div>
		</EditSurface>

		<div class="hero-content">
			<EditText id="skate.hero.headline" as="h1" fallback="Pirmas uždaras riedėjimo parkas Klaipėdoje" multiline={true} />
			<EditText id="skate.hero.intro" as="p" fallback="Tai vieta aktyviai veiklai, kūrybai ir saviraiškai, kur gimsta idėjos, stiprėja bendruomenė ir kiekvienas gali drąsiai išreikšti save." multiline={true} />
			<div class="hero-buttons">
				<a class="button primary" href="#treniruotes"><EditText id="skate.hero.primaryCta" fallback="Treniruotės su instruktoriumi" /><span>›</span></a>
				<a class="button light" href="#tvarkarastis"><EditText id="skate.hero.secondaryCta" fallback="Atviros sesijos" /><span>→</span></a>
			</div>
		</div>
	</EditSurface>

	<main>
		<EditSurface id="skate.surface.training" label="Treniruotės" class="training-section" background="#f1eee6" text="#050505">
			<span id="treniruotes" class="anchor-target"></span>
			<EditSurface id="skate.surface.trainingPanel" label="Training panel" class="white-panel" background="#ffffff" text="#050505">
				<div class="section-intro">
					<div>
						<EditText id="skate.training.eyebrow" fallback="Treniruotės" class="eyebrow" />
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
							<EditText id={`skate.training.tag.${index}`} fallback={item.tag} class="card-tag" />
							<div class="training-copy">
								<EditText id={`skate.training.title.${index}`} as="h3" fallback={item.title} multiline={true} />
								<a href="#kontaktai"><EditText id={`skate.training.cta.${index}`} fallback="Plačiau" /> <span class="training-arrow">↗</span></a>
							</div>
						</article>
					{/each}
				</div>
			</EditSurface>
		</EditSurface>

		<EditSurface id="skate.surface.sessions" label="Open sessions" class="sessions-section" background="#19151f" text="#ffffff">
			<span id="tvarkarastis" class="anchor-target"></span>
			<div class="sessions-photo">
				<EditImage id="skate.sessions.image" label="open riding session" class="sessions-image">
					{#snippet fallback()}<img src="/images/persimonas/open-session.webp" alt="Atvira riedėjimo sesija" />{/snippet}
				</EditImage>
			</div>
			<EditSurface id="skate.surface.sessionsCopy" label="Open sessions content" class="sessions-copy" background="#6b20ce" text="#ffffff">
				<EditText id="skate.sessions.eyebrow" fallback="Atviros sesijos" class="eyebrow light-eyebrow" />
				<EditText id="skate.sessions.headline" as="h2" fallback="Atviros riedėjimo sesijos" multiline={true} />
				<EditText id="skate.sessions.intro" as="p" fallback="Atvyk, kai parkas atviras laisvam riedėjimui! Laisvas laikas, judėjimas ir bendraminčių bendruomenė – kiekvieną savaitę." multiline={true} />
				<ul>
					<li><span class="session-check">✓</span><EditText id="skate.sessions.point.0" fallback="Nemokamos sesijos nuo 1 iki 2,5 val." /></li>
					<li><span class="session-check">✓</span><EditText id="skate.sessions.point.1" fallback="Tinka riedlentininkams, paspirtukininkams, in-line ir BMX rideriams" multiline={true} /></li>
					<li><span class="session-check">✓</span><EditText id="skate.sessions.point.2" fallback="Vyksta kiekvieną savaitę pagal tvarkaraštį" /></li>
				</ul>
				<a class="button yellow" href="#renginiai"><EditText id="skate.sessions.cta" fallback="Tvarkaraštis" /><span>→</span></a>
			</EditSurface>
		</EditSurface>

		<EditSurface id="skate.surface.services" label="Kitos paslaugos" class="services-section" background="#ffffff" text="#050505">
			<span id="paslaugos" class="anchor-target"></span>
			<div class="content-width">
				<div class="section-intro service-heading">
					<div>
						<EditText id="skate.services.eyebrow" fallback="Daugiau galimybių" class="eyebrow" />
						<EditText id="skate.services.headline" as="h2" fallback="Kitos paslaugos" />
					</div>
					<EditText id="skate.services.intro" as="p" fallback="Skateparkas gali tapti tavo šventės, renginio, pamokos ar tiesiog gero susitikimo vieta." multiline={true} />
				</div>
				<div class="service-grid">
					{#each services as service, index}
						<EditSurface id={`skate.surface.serviceCard.${index}`} label={`Service card ${index + 1}`} as="article" class={`${service.tone}-card`} background={service.background} text={service.text}>
							<EditText id={`skate.services.number.${index}`} fallback={`0${index + 1}`} class="service-number" />
							<EditText id={`skate.services.label.${index}`} fallback={service.label} class="pill" />
							<EditText id={`skate.services.title.${index}`} as="h3" fallback={service.title} multiline={true} />
							<EditText id={`skate.services.copy.${index}`} as="p" fallback={service.copy} multiline={true} />
							<a href="#kontaktai" aria-label={`Plačiau apie ${service.title}`}>↗</a>
						</EditSurface>
					{/each}
				</div>
			</div>
		</EditSurface>

		<EditSurface id="skate.surface.camp" label="Summer camps" class="camp-section" background="#f8d641" text="#050505">
			<span id="stovyklos" class="anchor-target"></span>
			<div class="camp-heading">
				<EditText id="skate.camp.eyebrow" fallback="Vasaros stovyklos" class="eyebrow" />
				<EditText id="skate.camp.headline" as="h2" fallback="SKATE CAMP" />
				<EditText id="skate.camp.intro" as="p" fallback="Judėjimas, nauji draugai ir vasara ant ratų." multiline={true} />
			</div>
			<EditSurface id="skate.surface.campCard" label="Summer camp card" class="camp-card" background="#ffffff" text="#050505">
				<EditImage id="skate.camp.image" label="summer camp image" class="camp-image">
					{#snippet fallback()}<img src="/images/persimonas/camp.webp" alt="Skate camp" />{/snippet}
				</EditImage>
				<div>
					<EditText id="skate.camp.date" fallback="Birž. 17 d." />
					<EditText id="skate.camp.cardHeadline" as="h3" fallback="Savaitė, kurią prisiminsi" multiline={true} />
					<EditText id="skate.camp.cardCopy" as="p" fallback="Penkių dienų stovykla jaunimui su treniruotėmis, žaidimais ir kūrybinėmis veiklomis." multiline={true} />
					<a class="button primary" href="#kontaktai"><EditText id="skate.camp.cta" fallback="Sužinoti daugiau" /><span>→</span></a>
				</div>
			</EditSurface>
		</EditSurface>

		<EditSurface id="skate.surface.events" label="Events" class="events-section" background="#151317" text="#ffffff">
			<span id="renginiai" class="anchor-target"></span>
			<div class="content-width">
				<div class="events-top">
					<div>
						<EditText id="skate.events.eyebrow" fallback="Kas vyksta parke" class="eyebrow" />
						<EditText id="skate.events.headline" as="h2" fallback="Renginiai" />
					</div>
					<a href="#kontaktai"><EditText id="skate.events.allCta" fallback="Visi renginiai" /><span>↗</span></a>
				</div>
				<div class="events-grid">
					{#each events as event, index}
						<article>
							<div class="event-date">
								<EditText id={`skate.events.day.${index}`} as="strong" fallback={event.day} />
								<EditText id={`skate.events.month.${index}`} fallback={event.month} />
							</div>
							<div>
								<EditText id={`skate.events.label.${index}`} fallback={event.label} class="event-label" />
								<EditText id={`skate.events.title.${index}`} as="h3" fallback={event.title} />
								<EditText id={`skate.events.details.${index}`} as="p" fallback="18:00 · AJE+ Skatepark, Gluosnių skg. 2a-k2" multiline={true} />
							</div>
							<span class="event-arrow">↗</span>
						</article>
					{/each}
				</div>
			</div>
		</EditSurface>

		<EditSurface id="skate.surface.about" label="About us" class="about-section" background="#dfeafb" text="#050505">
			<span id="apie" class="anchor-target"></span>
			<div>
				<EditText id="skate.about.eyebrow" fallback="Apie mus" class="eyebrow" />
				<EditText id="skate.about.headline" as="h2" fallback="Daugiau nei skateparkas" multiline={true} />
			</div>
			<div class="about-copy">
				<EditText id="skate.about.intro" as="p" fallback="Siekiame sukurti erdvę, kur žmonės gali judėti, kurti ir augti kartu. Čia gimsta idėjos, stiprėja bendruomenė ir kiekvienas gali drąsiai išreikšti save." multiline={true} />
				<a class="button light" href="#kontaktai"><EditText id="skate.about.cta" fallback="Susisiekti" /><span>→</span></a>
			</div>
		</EditSurface>
	</main>

	<EditSurface id="skate.surface.footer" label="Footer" as="footer" background="#ffffff" text="#141414">
		<span id="kontaktai" class="anchor-target"></span>
		<div class="footer-top">
			<EditText id="skate.footer.headline" as="h2" fallback="Kaip mus rasti?" />
			<a class="map-card" href="https://maps.google.com/?q=Gluosnių+skg.+2a-k2,+Klaipėda" target="_blank" rel="noreferrer">
				<div class="map-grid"></div>
				<EditText id="skate.footer.mapAddress" fallback={'Gluosnių skg. 2a-k2\nKlaipėda, 91250'} multiline={true} class="map-address" />
				<b><EditText id="skate.footer.mapCta" fallback="Atidaryti žemėlapį" /> ↗</b>
			</a>
		</div>
		<div class="footer-grid">
			<div class="footer-brand">
				<EditText id="skate.footer.logoMain" fallback="AJE" class="logo-mark" />
				<EditText id="skate.footer.logoSub" as="small" fallback="+ SKATEPARK" />
			</div>
			<div>
				<EditText id="skate.footer.aboutLabel" fallback="Apie mus" class="footer-label" />
				<EditText id="skate.footer.organization" as="p" fallback="Asmenybės ugdymo kultūros centras, VšĮ" multiline={true} />
				<EditText id="skate.footer.address" as="p" fallback="Gluosnių skg. 2a-k2, Klaipėda" multiline={true} />
			</div>
			<div>
				<EditText id="skate.footer.phoneLabel" fallback="Telefonas" class="footer-label" />
				<a href="tel:+37065183405"><EditText id="skate.footer.phone" fallback="+370 651 83405" /></a>
				<EditText id="skate.footer.emailLabel" fallback="El. paštas" class="footer-label second" />
				<a href="mailto:ajeskatepark@gmail.com"><EditText id="skate.footer.email" fallback="ajeskatepark@gmail.com" /></a>
			</div>
			<div>
				<EditText id="skate.footer.socialLabel" fallback="Sekite mus" class="footer-label" />
				<a href="https://www.facebook.com/ajeskatepark"><EditText id="skate.footer.facebook" fallback="Facebook" /> ↗</a>
			</div>
		</div>
		<div class="copyright"><EditText id="skate.footer.copyright" fallback="Visos teisės saugomos © 2026 – AJE+ Skatepark" /></div>
	</EditSurface>
</div>

<style>
	@font-face{font-family:Lexend;src:url('/fonts/lexend.woff2') format('woff2');font-weight:100 900;font-display:swap}
	:global {
	.skate-site{--purple:#6b20ce;--yellow:#f8d641;--cream:#f1eee6;--ink:#080808;width:100%;overflow:hidden;background:var(--cream);color:var(--ink);font-family:Lexend,Arial,sans-serif}
	.anchor-target{position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none}
	.hero.cms-surface{position:relative;min-height:900px;color:#fff;isolation:isolate}
	:global(.hero-media){position:absolute;inset:0;z-index:-3;width:100%;height:100%}:global(.hero-media img){display:block;width:100%;height:100%;object-fit:cover;object-position:center 42%}.hero-shade{position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.89) 0%,rgba(0,0,0,.48) 38%,rgba(0,0,0,.04) 76%)}
	.hero-image-control{position:absolute;z-index:7;right:20px;bottom:20px;display:flex;align-items:center;gap:8px;border:1px solid #d4d8d5;border-radius:8px;background:#fff;color:#173b2c;padding:10px 13px;box-shadow:0 8px 28px #071c1550;font-size:10px;font-weight:750;cursor:pointer}.hero-image-control svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.hero-image-control:hover{transform:translateY(-1px);box-shadow:0 10px 32px #071c1560}
	.site-header.cms-surface{position:absolute;z-index:4;top:20px;left:50%;display:flex;width:calc(100% - 160px);max-width:1280px;height:96px;align-items:center;gap:35px;padding:0 24px;border-radius:17px;background:#fff;color:#141414;transform:translateX(-50%);box-shadow:0 8px 25px #00000010}
	.logo{display:flex;min-width:62px;flex-direction:column;color:var(--purple);text-decoration:none;font-size:7px;font-weight:700;line-height:1}.logo-mark{font-size:24px;font-weight:300;letter-spacing:.04em}.site-header nav{display:flex;align-items:center;gap:28px;white-space:nowrap}.site-header nav a{font-size:13px;font-weight:650;text-decoration:none}.site-header nav .nav-chevron{margin-left:5px;font-size:16px}.header-actions{display:flex;flex:none;margin-left:auto;gap:18px}.schedule-button,.contact-button{display:flex;height:42px;flex:none;align-items:center;justify-content:center;border-radius:13px;text-decoration:none;font-size:12px;font-weight:720}.schedule-button{width:190px;gap:11px;background:var(--yellow)}.calendar{font-size:22px}.contact-button{width:95px;border:1px solid #e3be1d}.menu-toggle{display:none}
	.hero-content{position:absolute;left:max(80px,calc((100% - 1280px)/2));top:136px;width:510px}.hero-content :global(h1){margin:0;font-size:clamp(72px,6.7vw,96px);font-weight:720;letter-spacing:-.075em;line-height:.99;text-wrap:balance}.hero-content>:global(p){max-width:500px;margin:36px 0 38px;font-size:14px;line-height:1.45}.hero-buttons{display:flex;gap:20px}.button{display:inline-flex;min-height:39px;align-items:center;justify-content:space-between;gap:24px;border-radius:12px;padding:0 18px;text-decoration:none;font-size:13px;font-weight:700}.button.primary{background:var(--purple);color:#fff}.button.light{border:1px solid #e0bd21;background:#fff;color:#111}.button.yellow{background:var(--yellow);color:#111}
	:global(.training-section){padding:40px 80px 90px}.white-panel{max-width:1280px;margin:auto;border-radius:17px;background:#fff;padding:50px 45px 55px}.section-intro{display:grid;grid-template-columns:1.25fr .75fr;gap:50px;align-items:end;margin-bottom:36px}.eyebrow{display:block;margin-bottom:17px;color:#5e6673;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.section-intro :global(h2),.camp-heading :global(h2),.events-top h2,.about-section :global(h2),.footer-top h2{margin:0;font-size:clamp(48px,5vw,72px);font-weight:720;letter-spacing:-.065em;line-height:.98}.section-intro>:global(p){max-width:480px;margin:0 0 5px;font-size:16px;line-height:1.55;color:#58606b}
	.training-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.training-card{position:relative;min-height:380px;overflow:hidden;border-radius:15px;color:#fff}.training-card :global(.training-image){position:absolute;inset:0;width:100%;height:100%}.training-card :global(.training-image img){width:100%;height:100%;object-fit:cover}.image-gradient{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,#0001 35%,#000c)}.card-tag{position:absolute;top:15px;left:15px;padding:7px 10px;border-radius:20px;background:#fff;color:#111;font-size:10px;font-weight:700}.training-copy{position:absolute;right:18px;bottom:18px;left:18px}.training-copy h3{margin:0 0 17px;font-size:23px;letter-spacing:-.045em;line-height:1.05}.training-copy a{display:flex;align-items:center;justify-content:space-between;color:#fff;text-decoration:none;font-size:12px;font-weight:650}.training-copy a .training-arrow{font-size:20px}
	.sessions-section{display:grid;grid-template-columns:1.16fr .84fr;min-height:650px;background:#19151f;color:#fff}.sessions-photo,.sessions-photo :global(.sessions-image){height:100%;min-height:650px}.sessions-photo :global(img){display:block;width:100%;height:100%;object-fit:cover}.sessions-copy{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:80px clamp(40px,6vw,95px);background:var(--purple)}.light-eyebrow{color:#e6d2ff}.sessions-copy :global(h2){max-width:520px;margin:0;font-size:clamp(48px,5vw,70px);letter-spacing:-.07em;line-height:.98}.sessions-copy>:global(p){max-width:510px;margin:28px 0 22px;font-size:15px;line-height:1.55}.sessions-copy ul{display:grid;gap:15px;margin:0 0 34px;padding:0;list-style:none;font-size:13px;line-height:1.4}.sessions-copy li{display:flex;gap:12px}.sessions-copy li .session-check{display:grid;width:22px;height:22px;flex:none;place-items:center;border-radius:50%;background:var(--yellow);color:#111;font-weight:800}
	:global(.services-section){padding:100px 80px}.content-width{max-width:1280px;margin:auto}.service-heading{margin-bottom:46px}.service-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.service-grid article{position:relative;display:flex;min-height:380px;flex-direction:column;padding:25px;border-radius:17px}.yellow-card{background:var(--yellow)}.purple-card{background:#8a58d5;color:#fff}.green-card{background:#a8ce62}.blue-card{background:#d6e6ff}.service-number{font-size:12px;font-weight:750}.pill{align-self:flex-start;margin-top:22px;border:1px solid currentColor;border-radius:25px;padding:7px 10px;font-size:10px}.service-grid h3{margin:auto 0 15px;font-size:28px;letter-spacing:-.055em;line-height:1.02}.service-grid p{min-height:44px;margin:0;opacity:.75;font-size:12px;line-height:1.45}.service-grid article>a{display:grid;width:42px;height:42px;place-items:center;align-self:flex-end;margin-top:25px;border-radius:50%;background:#fff;color:#111;text-decoration:none;font-size:18px}
	.camp-section{display:grid;grid-template-columns:.82fr 1.18fr;gap:80px;padding:105px max(80px,calc((100% - 1280px)/2));background:var(--yellow)}.camp-heading{align-self:center}.camp-heading>p{max-width:420px;font-size:17px;line-height:1.5}.camp-card{display:grid;grid-template-columns:230px 1fr;overflow:hidden;border-radius:18px;background:#fff}.camp-card>.camp-image,.camp-card>.camp-image img{display:block;width:100%;height:100%}.camp-card>.camp-image img{object-fit:cover}.camp-card>div{display:flex;flex-direction:column;padding:34px}.camp-card>div>span{font-size:11px;font-weight:700;text-transform:uppercase}.camp-card h3{margin:auto 0 12px;font-size:36px;letter-spacing:-.055em;line-height:1}.camp-card p{margin:0 0 24px;color:#626873;font-size:13px;line-height:1.5}.camp-card .button{align-self:flex-start}
	.events-section{padding:100px 80px;background:#151317;color:#fff}.events-top{display:flex;align-items:end;justify-content:space-between;margin-bottom:45px}.events-top .eyebrow{color:#aaa3b0}.events-top>a{color:#fff;font-size:13px;text-decoration:none}.events-grid{border-top:1px solid #ffffff35}.events-grid article{display:grid;grid-template-columns:120px 1fr auto;align-items:center;gap:30px;padding:28px 0;border-bottom:1px solid #ffffff35}.event-date{display:flex;align-items:baseline;gap:8px}.event-date strong{font-size:46px}.event-date span,.event-label{font-size:10px;font-weight:700;text-transform:uppercase}.event-label{color:#e0c7ff}.events-grid h3{margin:6px 0;font-size:25px;letter-spacing:-.04em}.events-grid p{margin:0;color:#aaa3b0;font-size:12px}.event-arrow{font-size:28px}
	.about-section{display:grid;grid-template-columns:1fr 1fr;gap:80px;padding:110px max(80px,calc((100% - 1280px)/2));background:#dfeafb}.about-copy{align-self:end}.about-copy>:global(p){max-width:590px;margin:0 0 30px;font-size:19px;line-height:1.5}.about-copy .light{border-color:#111}
	footer{padding:100px max(80px,calc((100% - 1280px)/2)) 25px;background:#fff;color:#141414}.footer-top{display:grid;grid-template-columns:.7fr 1.3fr;gap:70px;align-items:start}.map-card{position:relative;display:flex;min-height:250px;flex-direction:column;justify-content:space-between;overflow:hidden;border-radius:17px;background:#e7e9ef;padding:28px;color:#111;text-decoration:none}.map-grid{position:absolute;inset:0;opacity:.32;background-image:linear-gradient(#768397 1px,transparent 1px),linear-gradient(90deg,#768397 1px,transparent 1px);background-size:38px 38px;transform:rotate(-8deg) scale(1.2)}.map-card span,.map-card b{position:relative}.map-card .map-address{white-space:pre-line;font-size:24px;font-weight:680;letter-spacing:-.04em}.map-card b{align-self:flex-end;font-size:12px}.footer-grid{display:grid;grid-template-columns:1.2fr 1.4fr 1.2fr .7fr;gap:45px;margin-top:75px;padding:45px 0;border-top:1px solid #d6d6d6}.footer-brand{display:flex;flex-direction:column;color:var(--purple)}.footer-brand .logo-mark{font-size:54px}.footer-brand small{font-weight:750}.footer-label{display:block;margin-bottom:13px;color:#7b818a;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.footer-label.second{margin-top:25px}.footer-grid p,.footer-grid a{display:block;margin:0 0 10px;font-size:13px;line-height:1.5;text-decoration:none}.copyright{padding-top:22px;border-top:1px solid #d6d6d6;color:#747982;font-size:10px}
	@media(max-width:1180px){.site-header.cms-surface{width:calc(100% - 48px)}.site-header nav{gap:16px}.site-header nav a{font-size:11px}.schedule-button{padding:0 12px}.training-grid,.service-grid{grid-template-columns:repeat(2,1fr)}.training-card{min-height:430px}.service-grid article{min-height:300px}}
	@media(max-width:820px){.hero.cms-surface{min-height:760px}.site-header.cms-surface{top:12px;height:74px;padding:0 18px}.menu-toggle{display:flex;width:38px;height:38px;flex-direction:column;justify-content:center;gap:6px;margin-left:auto;border:0;background:transparent}.menu-toggle span{display:block;width:24px;height:2px;background:#111}.site-header nav{position:absolute;top:84px;right:0;left:0;display:none;flex-direction:column;align-items:flex-start;gap:0;border-radius:14px;background:#fff;padding:14px}.site-header nav.open{display:flex}.site-header nav a{width:100%;padding:12px;font-size:13px}.header-actions{display:none}.hero-content{top:150px;right:25px;left:25px;width:auto}.hero-content :global(h1){max-width:570px;font-size:clamp(52px,13vw,78px)}.hero-content>:global(p){margin:28px 0}.hero-buttons{flex-direction:column;align-items:flex-start}:global(.training-section),:global(.services-section),.events-section{padding:50px 20px}.white-panel{padding:34px 20px}.section-intro,.camp-section,.about-section,.footer-top{grid-template-columns:1fr;gap:30px}.section-intro>:global(p){font-size:14px}.training-grid,.service-grid{grid-template-columns:1fr 1fr}.sessions-section{grid-template-columns:1fr}.sessions-photo,.sessions-photo :global(.sessions-image){min-height:410px}.sessions-copy{padding:55px 25px}.camp-section,.about-section,footer{padding:65px 25px}.camp-card{grid-template-columns:1fr}.camp-card>.camp-image{height:300px}.events-grid article{grid-template-columns:75px 1fr}.event-arrow{display:none}.footer-grid{grid-template-columns:1fr 1fr}}
	@media(max-width:520px){.site-header.cms-surface{width:calc(100% - 24px)}.hero.cms-surface{min-height:720px}.hero-content{top:135px;left:18px}.hero-content :global(h1){font-size:53px}.hero-content>:global(p){font-size:13px}.button{font-size:12px}.training-grid,.service-grid{grid-template-columns:1fr}.training-card{min-height:390px}.section-intro :global(h2),.camp-heading :global(h2),.events-top h2,.about-section :global(h2),.footer-top h2{font-size:45px}.service-grid article{min-height:310px}.camp-card>div{padding:25px}.events-top{align-items:start;flex-direction:column;gap:20px}.events-grid article{grid-template-columns:60px 1fr;gap:15px}.event-date strong{font-size:35px}.footer-grid{grid-template-columns:1fr}.footer-brand .logo-mark{font-size:46px}}
	}
</style>
