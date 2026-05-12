# GitHub Repository Setup Guide

## Topics to Add

Add the following topics to the GitHub repository for better discoverability:

```
jsonata
kafka
etl
integration-platform
nodejs
angular
quarkus
java
event-driven
microservices
reactive
postgresql
redis
docker
kubernetes
```

### How to Add Topics

1. Go to the repository page on GitHub
2. Click on the ⚙️ (gear icon) next to "About"
3. Add topics in the "Topics" field
4. Click "Save changes"

## GitHub Pages Setup

### Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages" section
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/docs`
4. Click "Save"

### Custom Domain (Optional)

If you want to use a custom domain:
1. Add a `CNAME` file in the `/docs` folder with your domain
2. Configure DNS settings at your domain provider
3. Enable "Enforce HTTPS" in GitHub Pages settings

### Landing Page

The documentation in `/docs` folder will be automatically published as a static site at:
```
https://[username].github.io/[repository-name]
```

## Repository Description

Update the repository description to:

```
CanonBridge - Enterprise Integration Platform with visual mapping studio, 
event-driven architecture, and real-time data transformation using JSONata
```

## Repository Settings Checklist

- [ ] Add topics (see list above)
- [ ] Enable GitHub Pages from `/docs` folder
- [ ] Update repository description
- [ ] Add repository website URL
- [ ] Enable Issues
- [ ] Enable Discussions (optional)
- [ ] Add LICENSE file (if not present)
- [ ] Add CONTRIBUTING.md (if not present)
- [ ] Configure branch protection rules for `main`
- [ ] Set up GitHub Actions for CI/CD

## Recommended Labels

Create the following labels for better issue management:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority
- `status: in progress` - Currently being worked on
- `status: blocked` - Blocked by dependencies

## Security

- [ ] Enable Dependabot alerts
- [ ] Enable Dependabot security updates
- [ ] Add SECURITY.md file with security policy
- [ ] Configure code scanning (CodeQL)

## Social Preview

Upload a social preview image (1280x640px) showing:
- CanonBridge logo
- Key features
- Technology stack icons

This will be displayed when sharing the repository on social media.
