# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in HookLab, please do not disclose it publicly via GitHub issues. Contact the maintainers privately via email:

`promptility.ai@gmail.com`

Please include:
- A description of the vulnerability and potential impact.
- Step-by-step reproduction instructions or proof of concept.
- Recommended mitigation steps if known.

We will acknowledge receipt within 48 hours and work with you on a coordinated disclosure timeline.

## Security Practices in HookLab

- **Untrusted Input Handling**: Webhook bodies and header values are treated as untrusted strings. They are escaped before rendering and never executed.
- **SSRF Mitigation**: Webhook replay requests validate hostnames and DNS resolutions to block loopback interfaces, private subnets (RFC 1918), and cloud metadata endpoints.
- **Rate Limiting**: Configurable token-bucket rate limiters prevent accidental ingestion floods.
- **No Secret Logging**: Signing secrets and authentication tokens are never recorded in server output logs.
- **Data Expiry**: Stored webhook events automatically expire based on endpoint time-to-live settings.
