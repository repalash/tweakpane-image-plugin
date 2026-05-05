import {Controller, Value, ViewProps} from '@tweakpane/core';

import {ImageResolvable} from './model';
import {createPlaceholderImage, loadImage} from './utils';
import {PluginView} from './view';

interface Config {
	value: Value<ImageResolvable>;
	imageFit: 'contain' | 'cover';
	extensions: string[];
	viewProps: ViewProps;
	clickCallback?: (event: MouseEvent, input: HTMLInputElement) => void;
}

let placeholderImage: HTMLImageElement | null = null;

export class PluginController implements Controller<PluginView> {
	public readonly value: Value<ImageResolvable>;
	public readonly view: PluginView;
	public readonly viewProps: ViewProps;

	constructor(doc: Document, config: Config) {
		this.value = config.value;
		this.viewProps = config.viewProps;
		this.view = new PluginView(doc, {
			viewProps: this.viewProps,
			extensions: config.extensions,
			imageFit: config.imageFit,
			clickCallback: config.clickCallback,
		});

		this.onFile = this.onFile.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);

		this.view.input.addEventListener('change', this.onFile);
		this.view.element.addEventListener('drop', this.onDrop);
		this.view.element.addEventListener('dragstart', this.onDragStart);
		this.view.element.addEventListener('dragover', this.onDragOver);
		this.view.element.addEventListener('dragleave', this.onDragLeave);

		this.viewProps.handleDispose(() => {
			this.view.input.removeEventListener('change', this.onFile);
			this.view.element.removeEventListener('drop', this.onDrop);
			this.view.element.removeEventListener('dragstart', this.onDragStart);
			this.view.element.removeEventListener('dragover', this.onDragOver);
			this.view.element.removeEventListener('dragleave', this.onDragLeave);
		});

		this.value.emitter.on('change', () => this.handleValueChange());

		this.handleValueChange();
	}

	private onFile(event: Event): void {
		const files = (event?.target as HTMLInputElement).files;
		if (!files || !files.length) return;

		const file = files[0];
		this.setValue(file);
		// this.updateImage(url);
	}

	private onDrop(event: DragEvent) {
		event.preventDefault();
		try {
			const {dataTransfer} = event;
			const file = dataTransfer?.files[0];
			if (file) {
				// const url = URL.createObjectURL(file);
				// this.updateImage(url);
				this.setValue(file);
			} else {
				const imgId = dataTransfer?.getData('img-id');
				if (imgId) {
					const img = document.getElementById(imgId) as HTMLImageElement;
					this.setValue(img);
				} else {
					const url = dataTransfer?.getData('url');
					if (!url) throw new Error('No url');
					this.setValue(url);
				}
				// loadImage(url).then(async (image) => {
				// 	console.log('drop', image);
				// 	const clone = await cloneImage(image);
				// 	// this.updateImage(clone.src);
				// 	this.setValue(clone);
				// });
			}
		} catch (e) {
			console.error('Could not parse the dropped image', e);
		} finally {
			this.view.changeDraggingState(false);
		}
	}

	private onDragStart(event: DragEvent) {
		event.dataTransfer?.setData('img-id', this.view.image_.id);
		event.dataTransfer?.setDragImage(this.view.image_, 0, 0);
	}

	private onDragOver(event: Event) {
		event.preventDefault();
		this.view.changeDraggingState(true);
	}

	private onDragLeave() {
		this.view.changeDraggingState(false);
	}

	private handleImage(image: ImageResolvable) {
		if (image instanceof HTMLImageElement) {
			this.updateImage(image.src);
		} else if (typeof image === 'string' || !image) {
			if (image === 'placeholder' || !image) {
				image = this.handlePlaceholderImage().src;
			}
			this.updateImage(image as string);
		} else {
			this.setValue(image);
		}
	}

	private updateImage(src: string) {
		this.view.changeImage(src);
	}

	private setValue(src: ImageResolvable) {
		if (src instanceof HTMLImageElement) {
			this.value.setRawValue(src);
		} else if (src instanceof File) {
			// Only wrap standard raster images into an <img> for preview. For anything
			// the browser can't decode natively (e.g. .cube LUT, .hdr, .exr, .ktx2,
			// custom formats), pass the File through unchanged so a downstream consumer
			// can handle it. Previously this always called loadImage(createObjectURL),
			// producing a broken HTMLImageElement for non-image formats and silently
			// losing the original File.
			if (src.type && src.type.indexOf('image/') === 0) {
				const url = URL.createObjectURL(src) + '#' + src.name;
				(src as any).src = url;
				const img = loadImage(url);
				// URL.revokeObjectURL(url); //todo: revoke sometime.
				this.value.setRawValue(img || src);
			} else {
				this.value.setRawValue(src);
			}
		} else if (src) {
			this.value.setRawValue(loadImage(src));
		} else {
			this.value.setRawValue(this.handlePlaceholderImage());
		}
	}

	private handleValueChange() {
		this.handleImage(this.value.rawValue);
	}

	private handlePlaceholderImage(): HTMLImageElement {
		if (!placeholderImage) {
			placeholderImage = createPlaceholderImage();
		}
		return placeholderImage;
	}
}
