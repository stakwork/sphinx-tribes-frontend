import fs from 'fs';
import path from 'path';

describe('nginx 404 handling config', () => {
  const config = fs.readFileSync(path.join(process.cwd(), 'deploy', 'nginx.conf'), 'utf8');

  it('serves the React app for direct SPA route access', () => {
    expect(config).toContain('try_files $uri $uri/ /index.html;');
  });

  it('keeps missing static assets as nginx 404 responses', () => {
    expect(config).toContain('location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|json|txt|webp|woff|woff2)$');
    expect(config).toContain('try_files $uri =404;');
    expect(config).not.toContain('error_page 404 /index.html;');
  });
});
