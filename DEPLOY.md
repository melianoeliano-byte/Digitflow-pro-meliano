# GitHub Pages Deployment Configuration

This file configures GitHub Pages to serve the Digitflow Pro Dashboard.

## Configuration Details

- **Source Branch**: `main`
- **Build Output**: `dist/` directory
- **Build Tool**: Vite
- **Deploy URL**: `https://melianoeliano-byte.github.io/Digitflow-pro-meliano/`

## Deployment Steps

### Automatic (via GitHub Actions)

The `.github/workflows/deploy.yml` workflow automatically:
1. Builds the project on push to `main`
2. Uploads build artifacts
3. Deploys to GitHub Pages

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Post-Deployment Verification

1. Visit https://melianoeliano-byte.github.io/Digitflow-pro-meliano/
2. Verify dashboard loads correctly
3. Check browser console for errors
4. Test API connectivity
5. Verify all features functional

## Environment Variables

No environment variables required. Settings stored in browser localStorage.

## Troubleshooting Deployment

### Pages not updating
- Check GitHub Actions workflow status
- Verify `gh-pages` branch exists
- Clear browser cache
- Wait 5-10 minutes for GitHub Pages cache update

### Build failures
- Check GitHub Actions logs
- Run `npm run build` locally to debug
- Verify all dependencies installed
- Check for syntax errors

## Security Notes

- API tokens stored locally in browser (not sent to server)
- HTTPS enforced on GitHub Pages
- No sensitive data in repository
- All API calls directly to Deriv servers
