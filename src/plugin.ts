import {
	BaseInputParams,
	BindingTarget,
	InputBindingPlugin,
	ParamsParsers,
	parseParams,
} from '@tweakpane/core';

import {PluginController} from './controller';
import {ImageResolvable} from './model';

export interface PluginInputParams extends BaseInputParams {
	view: 'input-image';
	imageFit?: 'contain' | 'cover';
	extensions?: string[];
}

const DEFAULT_EXTENSIONS = ['.jpg', '.png', '.gif'];

export const TweakpaneImagePlugin: InputBindingPlugin<
	ImageResolvable,
	ImageResolvable,
	PluginInputParams
> = {
	id: 'input-image',
	type: 'input',
	css: '__css__',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (!(exValue instanceof HTMLImageElement || typeof exValue === 'string')) {
			return null;
		}

		const p = ParamsParsers;
		const result = parseParams<PluginInputParams>(params, {
			view: p.required.constant('input-image'),
			acceptUrl: p.optional.boolean,
			clickCallback: p.optional.function,
			imageFit: p.optional.custom((v) =>
				v === 'contain' || v === 'cover' ? v : undefined,
			),
			extensions: p.optional.array(p.required.string),
		});
		if (!result) {
			return null;
		}

		return {
			initialValue: exValue,
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: any): ImageResolvable => {
				if (exValue.src !== undefined) {
					return exValue.src === '' ? 'placeholder' : exValue.src;
				} else {
					return typeof exValue === 'string' ? exValue : exValue;
				}
			};
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				target.write(inValue);
			};
		},
	},

	controller(args) {
		return new PluginController(args.document, {
			value: args.value,
			imageFit: args.params.imageFit ?? 'cover',
			clickCallback: args.params.clickCallback as any,
			viewProps: args.viewProps,
			extensions: args.params.extensions ?? DEFAULT_EXTENSIONS,
		});
	},
};
