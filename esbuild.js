const esbuild = require("esbuild");
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

/**
 * Ensure directory exists
 */
async function ensureDir(dir) {
	try {
		await fs.access(dir);
	} catch {
		await fs.mkdir(dir, { recursive: true });
	}
}

/**
 * Copy UI assets to dist directory
 */
async function copyUIAssets() {
	const uiDir = path.join(__dirname, 'ui');
	const distUiDir = path.join(__dirname, 'dist', 'ui');

	// Ensure dist/ui exists
	await ensureDir(distUiDir);

	// Copy all files from ui/ to dist/ui/
	const files = await fs.readdir(uiDir);
	for (const file of files) {
		const srcPath = path.join(uiDir, file);
		const stat = await fs.stat(srcPath);

		if (stat.isFile() || stat.isSymbolicLink()) {
			const destPath = path.join(distUiDir, file);
			await fs.copyFile(srcPath, destPath);
			console.log(`Copied ${file} to dist/ui/`);
		}
	}
}

/**
 * Copy source UI files to dist directory
 * Only copy webview assets (.css, .js, images) - TypeScript is bundled
 */
async function copySourceUI() {
	const srcUiDir = path.join(__dirname, 'src', 'ui');
	const distUiDir = path.join(__dirname, 'dist', 'ui');

	// Ensure dist/ui exists
	await ensureDir(distUiDir);

	// Copy only webview assets (not .ts files)
	const files = await fs.readdir(srcUiDir);
	for (const file of files) {
		const ext = path.extname(file).toLowerCase();
		const srcPath = path.join(srcUiDir, file);

		// Only copy asset files, skip TypeScript source
		if (['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.woff2', '.ttf'].includes(ext)) {
			const stat = await fs.stat(srcPath);
			if (stat.isFile() || stat.isSymbolicLink()) {
				const destPath = path.join(distUiDir, file);
				await fs.copyFile(srcPath, destPath);
				console.log(`Copied src/ui/${file} to dist/ui/`);
			}
		}
	}
}

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
	});

	// Build and copy UI assets
	await ctx.rebuild();
	await copySourceUI();
	await copyUIAssets();
	await ctx.dispose();

	if (watch) {
		// In watch mode, watch the ui directories and copy when changed
		const srcUiDir = path.join(__dirname, 'src', 'ui');
		const uiDir = path.join(__dirname, 'ui');

		if (fsSync.existsSync(srcUiDir)) {
			fsSync.watch(srcUiDir, async (event, filename) => {
				if (filename) {
					console.log(`[watch] src/ui/${filename} changed`);
					await copySourceUI();
				}
			});
		}

		if (fsSync.existsSync(uiDir)) {
			fsSync.watch(uiDir, async (event, filename) => {
				if (filename) {
					console.log(`[watch] ui/${filename} changed`);
					await copyUIAssets();
				}
			});
		}

		await ctx.watch();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
