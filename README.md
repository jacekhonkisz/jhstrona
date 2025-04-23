# Video Edit Project

A web-based video editing application that provides tools for video manipulation and enhancement.

## Features

- Video editing capabilities
- Calculator functionality
- Consultation services
- Multi-language support (English/Polish)

## Development Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd videoedit
```

2. Install dependencies:
```bash
# Add dependency installation instructions here
```

3. Start the development server:
```bash
python -m http.server 8000
```

## Project Structure

```
videoedit/
├── index.html          # Main application page
├── index-en.html       # English version
├── styles.css          # Main stylesheet
├── script.js           # Main application logic
├── calculator.js       # Calculator functionality
├── assets/            # Static assets
│   ├── images/
│   └── videos/
└── docs/              # Documentation
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Version Control

We follow Git Flow branching strategy:
- `main` - production-ready code
- `develop` - development branch
- `feature/*` - new features
- `hotfix/*` - urgent fixes
- `release/*` - release preparation

## Commit Convention

We follow the convention: `type(scope): description`

Types:
- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting changes
- refactor: code refactoring
- test: adding tests
- chore: maintenance tasks 