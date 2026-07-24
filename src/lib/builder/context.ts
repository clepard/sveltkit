import { getContext, setContext } from 'svelte';
import type { PageDocument, SurfaceColors } from '$lib/server/db/schema';

export type BuilderImage = {
	id: string;
	alt: string;
	width: number;
	height: number;
	variants: Array<{ width: number; format: 'webp' | 'avif'; filename: string }>;
};

export type BuilderContext = {
	document: PageDocument;
	editing: boolean;
	images: BuilderImage[];
	registerText: (id: string, fallback: string) => void;
	registerImage: (id: string) => void;
	registerSurface: (id: string, defaults: SurfaceColors) => void;
	openImage: (id: string, label: string) => void;
	openColors: (id: string, label: string) => void;
};

const KEY = Symbol('visual-builder');
export const provideBuilder = (context: BuilderContext) => setContext(KEY, context);
export const useBuilder = () => getContext<BuilderContext>(KEY);
