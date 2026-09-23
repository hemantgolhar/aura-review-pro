import { defineConfig } from 'vite';

const [owner, repository] = (process.env.GITHUB_REPOSITORY || '').split('/');
const base = repository && repository.toLowerCase() !== `${owner}.github.io`.toLowerCase()
  ? `/${repository}/`
  : '/';

export default defineConfig({
  base,
  plugins: [{
    name: 'github-pages-routes',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html'].source;
      for (const fileName of ['404.html', 'super-admin/index.html', 'admin/index.html', 'r/demo/index.html']) {
        this.emitFile({ type: 'asset', fileName, source: html });
      }
    },
  }],
});
