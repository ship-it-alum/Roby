# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Roby, please send an email to excdotfun@gmail.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** create a public GitHub issue for security vulnerabilities.

We aim to respond within 48 hours and will keep you updated on the remediation progress.

## Security Considerations

### Key Management

- Never commit private keys to the repository
- Use hardware wallets for mainnet deployments
- Rotate credentials regularly

### Smart Contract Security

- All state changes are logged
- Multi-layer authorization checks
- Emergency stop functionality available
- Merkle proof verification for all operations

### API Security

- Rate limiting enabled by default
- Input validation on all endpoints
- HTTPS required for production
- Authentication required for sensitive operations

## Best Practices

1. Always test on devnet before mainnet
2. Implement monitoring and alerting
3. Keep dependencies updated
4. Regular security audits recommended
5. Use principle of least privilege



