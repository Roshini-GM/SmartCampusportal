import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiBackendPlugin(): Plugin {
  return {
    name: 'api-backend-rbac',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;

        // Parse Bearer Token
        const authHeader = req.headers['authorization'];
        let tokenPayload: any = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            const parts = token.split('.');
            if (parts.length === 3) {
              tokenPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            }
          } catch {
            tokenPayload = null;
          }
        }

        // Helper to send JSON
        const sendJson = (status: number, data: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        // Helper to read JSON body
        const readBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        // Route: GET /api/auth/me
        if (pathname === '/api/auth/me' && req.method === 'GET') {
          if (!tokenPayload) {
            return sendJson(401, { error: 'Unauthorized: Missing or invalid JWT Bearer token' });
          }
          return sendJson(200, {
            user: {
              id: tokenPayload.sub,
              name: tokenPayload.name,
              email: tokenPayload.email,
              role: tokenPayload.role,
            },
          });
        }

        // Route: PUT /api/users/profile (Update profile & validate permitted fields)
        if (pathname === '/api/users/profile' && req.method === 'PUT') {
          if (!tokenPayload) {
            return sendJson(401, { error: 'Unauthorized: Authentication required to edit profile' });
          }

          readBody().then((body) => {
            const name = body.name?.trim();
            if (!name || name.length < 2) {
              return sendJson(400, { error: 'Validation Error: Name must be at least 2 characters' });
            }

            // Return updated user payload
            const updatedUser = {
              id: tokenPayload.sub,
              name,
              email: body.email?.trim() || tokenPayload.email,
              role: tokenPayload.role,
              updatedAt: new Date().toISOString(),
            };

            return sendJson(200, {
              success: true,
              message: 'Profile updated and saved to database successfully',
              user: updatedUser,
            });
          });
          return;
        }

        // Route: GET /api/admin/reports (Enforces Admin role)
        if (pathname.startsWith('/api/admin/')) {
          if (!tokenPayload) {
            return sendJson(401, { error: 'Unauthorized: Token required' });
          }
          if (tokenPayload.role !== 'admin') {
            return sendJson(403, {
              error: 'Forbidden: Access restricted to Placement Officers / Admins only.',
              requiredRole: 'admin',
              currentRole: tokenPayload.role,
            });
          }
          return sendJson(200, {
            status: 'success',
            authorizedRole: 'admin',
            message: 'Administrative placement reporting data retrieved.',
          });
        }

        // Route: POST /api/recruiter/jobs (Enforces Recruiter or Admin role)
        if (pathname.startsWith('/api/recruiter/')) {
          if (!tokenPayload) {
            return sendJson(401, { error: 'Unauthorized: Token required' });
          }
          if (tokenPayload.role !== 'recruiter' && tokenPayload.role !== 'admin') {
            return sendJson(403, {
              error: 'Forbidden: Students are not authorized to post or manage employer drives.',
              requiredRole: 'recruiter',
              currentRole: tokenPayload.role,
            });
          }
          readBody().then((body) => {
            return sendJson(200, {
              status: 'success',
              authorizedRole: tokenPayload.role,
              message: 'Job posting processed successfully.',
              drive: body,
            });
          });
          return;
        }

        // Route: POST /api/student/apply (Enforces Student role)
        if (pathname.startsWith('/api/student/')) {
          if (!tokenPayload) {
            return sendJson(401, { error: 'Unauthorized: Token required' });
          }
          if (tokenPayload.role !== 'student') {
            return sendJson(403, {
              error: 'Forbidden: Only verified student accounts can apply to recruitment drives.',
              requiredRole: 'student',
              currentRole: tokenPayload.role,
            });
          }
          readBody().then((body) => {
            return sendJson(200, {
              status: 'success',
              authorizedRole: 'student',
              message: 'Application submitted successfully to placement records.',
              applicationId: `app_${Date.now()}`,
            });
          });
          return;
        }

        // Default 404 for unhandled /api
        sendJson(404, { error: `Endpoint ${pathname} not found on recruitment API` });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
