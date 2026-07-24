# Building editable site pages

Build the website layout in `src/lib/components/SitePage.svelte`. Use ordinary HTML and Svelte for structure that the client should not change, and use the editable components for content they may change through `/admin`.

## Imports

If you create another shared page component, import the editor components at the top:

```svelte
<script lang="ts">
	import EditText from '$lib/builder/EditText.svelte';
	import EditImage from '$lib/builder/EditImage.svelte';
	import EditButton from '$lib/builder/EditButton.svelte';
	import EditSurface from '$lib/builder/EditSurface.svelte';
</script>
```

`SitePage.svelte` already has these imports.

## Normal HTML and Svelte

Write regular markup for fixed layout and protected content:

```svelte
<section class="contact">
	<div class="container">
		<!-- Editable components can go here. -->
	</div>
</section>
```

Normal elements are not editable in `/admin`.

## Editable text

```svelte
<EditText
	id="contact.heading"
	as="h2"
	fallback="Contact us"
/>
```

- `id` is the permanent, unique content key.
- `as` selects the rendered HTML element, such as `h1`, `h2`, `p`, or `span`.
- `fallback` is the initial text shown before saved content exists.
- Add `multiline={true}` to allow line breaks.
- Add `class="name"` to style the rendered element.

Example paragraph:

```svelte
<EditText
	id="contact.description"
	as="p"
	fallback="Tell us about your project."
	multiline={true}
	class="description"
/>
```

Do not change an ID after content has been saved. A different ID is treated as a new content field.

## Editable image

```svelte
<EditImage
	id="contact.image"
	label="Contact image"
	class="contact-image"
/>
```

The client can select or upload an image. The image's alt text is entered during upload and preserved in the media library.

You can provide a placeholder when no image is selected:

```svelte
<EditImage id="contact.image" label="Contact image" class="contact-image">
	{#snippet fallback()}
		<div class="image-placeholder">Choose an image</div>
	{/snippet}
</EditImage>
```

## Editable button

```svelte
<EditButton
	id="contact.button"
	href="/contact"
	fallback="Start a project"
	class="primary-button"
/>
```

The client can edit the visible label and button colors. The `href` remains fixed in source code and cannot be changed through the editor.

## Editable section colors

Wrap a section with `EditSurface` when its background and text colors should be editable:

```svelte
<EditSurface
	id="contact.section"
	label="Contact section"
	as="section"
	class="contact"
	background="#f4f1e9"
	text="#17211b"
>
	<EditText
		id="contact.heading"
		as="h2"
		fallback="Contact us"
	/>
</EditSurface>
```

- `background` and `text` provide the initial colors.
- `as` defaults to `section` and can also be `nav`, `footer`, `div`, and so on.
- The color button appears only inside the admin editor.

## Complete section example

```svelte
<EditSurface
	id="about.section"
	label="About section"
	class="about"
>
	<div class="about-content">
		<EditText
			id="about.heading"
			as="h2"
			fallback="About our studio"
		/>

		<EditText
			id="about.description"
			as="p"
			fallback="We create thoughtful digital experiences."
			multiline={true}
		/>

		<EditButton
			id="about.button"
			href="/about"
			fallback="Learn more"
		/>
	</div>

	<EditImage
		id="about.image"
		label="About section image"
		class="about-image"
	/>
</EditSurface>

<style>
	.about {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		padding: 5rem 2rem;
	}

	.about-content {
		max-width: 600px;
	}

	@media (max-width: 700px) {
		.about {
			grid-template-columns: 1fr;
		}
	}
</style>
```

## Rules to remember

1. Use normal HTML and Svelte for layout and anything the client must not edit.
2. Use `EditText`, `EditImage`, or `EditButton` for editable content.
3. Use `EditSurface` when a section's colors should be editable.
4. Give every editable component a unique and stable ID.
5. Keep destinations such as button and navigation links in source code.
6. Do not write manual admin bindings such as `draft.navigation.about`; components register themselves automatically.
7. The public website and `/admin` should render the same shared site component so their layouts remain identical.
