# Contributing to HPKV REST Client SDKs

Thank you for your interest in contributing to HPKV REST Client SDKs! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to uphold our Code of Conduct, which is to treat all individuals with respect and create a welcoming environment for all.

## How to Contribute

### Reporting Bugs

If you find a bug, please submit an issue with the following information:

- A clear, descriptive title
- A detailed description of the issue
- Steps to reproduce the bug
- Expected behavior
- Screenshots (if applicable)
- Environment information (OS, SDK version, language version)

### Suggesting Features

We welcome feature suggestions! Please provide:

- A clear, descriptive title
- Detailed description of the suggested feature
- Any relevant examples or mockups
- Explanation of why this feature would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`) from develop
3. Make your changes
4. Ensure your code follows our style guidelines
5. Make sure your code passes all tests
6. Update documentation if necessary
7. Commit your changes (`git commit -m 'Add some feature'`)
8. Push to the branch (`git push origin feature/your-feature-name`)
9. Open a Pull Request

#### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update relevant documentation
- Link to any related issues
- Describe what your changes do and why they should be included

## Development Process

### Getting Started

1. Clone the repository
2. Install dependencies for the SDK you're working on
3. Set up your development environment

### SDK Structure

Each SDK should follow a consistent structure:

```
sdk/[language]/
  ├── src/               - Source code
  ├── tests/             - Unit and integration tests
  ├── examples/          - Example code showing SDK usage
  ├── README.md          - SDK-specific documentation
  ├── LICENSE            - License information
  └── package.json       - (or equivalent package definition file)
```

### Code Style

- Follow the established code style for each language
- Use meaningful variable and function names
- Write clear, descriptive comments
- For JavaScript/TypeScript code:
  - Follow ESLint rules defined in the project
  - Use TypeScript for type safety
  - Format code with Prettier

### Testing

- Write tests for all new functionality
- Ensure all tests pass before submitting a PR
- Include integration tests where appropriate

### Documentation

- Update the README.md if your changes impact usage
- Document new features or API changes
- Keep code examples up-to-date

### Versioning

We follow [Semantic Versioning](https://semver.org/) for releases:

- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes

## Adding New Language SDKs

If you're adding support for a new language:

1. Follow the existing SDK structure as a model
2. Create comprehensive documentation
3. Implement all core API functionality
4. Include thorough tests and examples
5. Make sure your SDK supports all existing features
6. Update the root README.md to include your new SDK

## License

By contributing, you agree that your contributions will be licensed under the same license as the original project. 