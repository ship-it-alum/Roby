# Contributing to Roby

Thank you for your interest in contributing to Roby, a Solana-based robotics control system.

## Development Setup

### Prerequisites

- Rust 1.75 or higher
- Solana CLI 1.18 or higher
- Node.js 18 or higher
- Git

### Clone and Build

```bash
git clone https://github.com/ship-it-alum/Roby.git
cd Roby

# Build Solana program
cd program
cargo build-bpf

# Build SDK
cd ../sdk
npm install
npm run build

# Setup API
cd ../api
npm install
```

## Code Standards

### Rust Code

- Follow Rust standard formatting (`cargo fmt`)
- Run Clippy and fix warnings (`cargo clippy`)
- Add tests for new functionality
- Document public APIs with doc comments

### TypeScript Code

- Use TypeScript strict mode
- Follow ESLint rules
- Add JSDoc comments for public APIs
- Write unit tests for new features

## Testing

### Program Tests

```bash
cd program
cargo test-bpf
```

### SDK Tests

```bash
cd sdk
npm test
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## Security

If you discover a security vulnerability, please email excdotfun@gmail.com instead of creating a public issue.

## Code of Conduct

Be respectful and professional in all interactions.











