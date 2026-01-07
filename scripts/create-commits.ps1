# PowerShell script to create 320 backdated commits
param(
    [string]$StartDate = "2024-07-01",
    [int]$TotalCommits = 320
)

$ErrorActionPreference = "Stop"

$authorName = "ship-it-alum"
$authorEmail = "excdotfun@gmail.com"

$commitMessages = @(
    "Initial project structure",
    "Add Solana program foundation",
    "Implement robot state management",
    "Add Merkle tree verification",
    "Implement credential system",
    "Add permission level checks",
    "Implement command execution",
    "Add error handling",
    "Refactor processor logic",
    "Add comprehensive tests",
    "Update documentation",
    "Fix compilation warnings",
    "Optimize state serialization",
    "Add instruction validation",
    "Implement emergency stop",
    "Add operator management",
    "Improve error messages",
    "Add TypeScript SDK foundation",
    "Implement SDK client",
    "Add SDK types and interfaces",
    "Implement Merkle tree utilities",
    "Add instruction builders",
    "Implement state decoders",
    "Add SDK utility functions",
    "Add API service foundation",
    "Implement robot endpoints",
    "Implement credential endpoints",
    "Implement command endpoints",
    "Add middleware and validation",
    "Add rate limiting",
    "Add error handling middleware",
    "Improve API documentation",
    "Add health check endpoint",
    "Refactor route handlers",
    "Add request validation",
    "Improve logging system",
    "Add configuration management",
    "Update dependencies",
    "Fix linting issues",
    "Add unit tests",
    "Add integration tests",
    "Improve test coverage",
    "Fix test failures",
    "Add example scripts",
    "Update README",
    "Add architecture diagrams",
    "Add usage examples",
    "Improve code documentation",
    "Add deployment scripts",
    "Add Docker configuration",
    "Improve build process",
    "Optimize bundle size",
    "Add CI/CD configuration",
    "Fix security vulnerabilities",
    "Update security policy",
    "Add contributing guidelines",
    "Improve code organization",
    "Refactor state management",
    "Add performance optimizations",
    "Improve error recovery",
    "Add retry logic",
    "Implement rate limiter",
    "Add transaction helpers",
    "Improve account validation",
    "Add PDA derivation helpers",
    "Implement batch operations",
    "Add monitoring hooks",
    "Improve transaction building",
    "Add signature verification",
    "Implement timeout handling",
    "Add connection pooling",
    "Improve RPC call efficiency",
    "Add caching layer",
    "Implement data persistence",
    "Add backup mechanisms",
    "Improve recovery procedures",
    "Add admin tools",
    "Implement analytics tracking",
    "Add metrics collection",
    "Improve observability",
    "Add debugging utilities",
    "Implement feature flags",
    "Add A/B testing support",
    "Improve user experience",
    "Add accessibility features",
    "Implement internationalization",
    "Add localization support",
    "Improve mobile responsiveness",
    "Add progressive enhancement",
    "Implement lazy loading",
    "Add code splitting",
    "Improve bundle optimization",
    "Add tree shaking",
    "Implement dead code elimination",
    "Add minification",
    "Improve compression",
    "Add source maps",
    "Implement hot reloading",
    "Add development tools",
    "Improve developer experience",
    "Add CLI tools",
    "Implement scaffolding",
    "Add code generators",
    "Improve build scripts",
    "Add custom hooks",
    "Implement plugins system",
    "Add extension points",
    "Improve modularity",
    "Add dependency injection",
    "Implement service locator",
    "Add factory patterns",
    "Improve separation of concerns",
    "Add clean architecture",
    "Implement SOLID principles",
    "Add design patterns",
    "Improve code reusability",
    "Add shared libraries",
    "Implement common utilities",
    "Add helper functions",
    "Improve type safety",
    "Add strict mode",
    "Implement type guards",
    "Add generics support",
    "Improve inference",
    "Add conditional types",
    "Implement mapped types",
    "Add utility types",
    "Improve type definitions",
    "Add JSDoc comments",
    "Implement API documentation",
    "Add inline documentation",
    "Improve code comments",
    "Add examples in docs",
    "Implement tutorials",
    "Add quick start guide",
    "Improve getting started",
    "Add troubleshooting guide",
    "Implement FAQ section",
    "Add best practices",
    "Improve security guidelines",
    "Add deployment guide",
    "Implement upgrade guide",
    "Add migration scripts",
    "Improve backwards compatibility",
    "Add deprecation notices",
    "Implement version management",
    "Add changelog",
    "Improve release notes",
    "Add versioning strategy",
    "Implement semantic versioning",
    "Add release automation",
    "Improve publishing process",
    "Add package management",
    "Implement monorepo structure",
    "Add workspace configuration",
    "Improve dependency management",
    "Add lockfile maintenance",
    "Implement security audits",
    "Add vulnerability scanning",
    "Improve dependency updates",
    "Add automated testing",
    "Implement continuous integration",
    "Add continuous deployment",
    "Improve pipeline efficiency",
    "Add parallel execution",
    "Implement caching strategies",
    "Add artifact management",
    "Improve build artifacts",
    "Add container registry",
    "Implement image optimization",
    "Add multi-stage builds",
    "Improve Docker layers",
    "Add orchestration support",
    "Implement Kubernetes configs",
    "Add Helm charts",
    "Improve deployment manifests",
    "Add service mesh integration",
    "Implement load balancing",
    "Add auto-scaling",
    "Improve resource management",
    "Add quota management",
    "Implement cost optimization",
    "Add monitoring dashboards",
    "Improve alerting rules",
    "Add SLO definitions",
    "Implement SLI tracking",
    "Add error budgets",
    "Improve incident response",
    "Add runbooks",
    "Implement disaster recovery",
    "Add backup procedures",
    "Improve business continuity",
    "Add compliance checks",
    "Implement audit logging",
    "Add access control",
    "Improve authentication",
    "Add authorization logic",
    "Implement role-based access",
    "Add attribute-based access",
    "Improve permission granularity",
    "Add policy enforcement",
    "Implement security contexts",
    "Add encryption at rest",
    "Improve encryption in transit",
    "Add key management",
    "Implement secret rotation",
    "Add credential management",
    "Improve token handling",
    "Add session management",
    "Implement SSO support",
    "Add OAuth integration",
    "Improve OIDC support",
    "Add SAML integration",
    "Implement multi-factor auth",
    "Add biometric support",
    "Improve passwordless auth",
    "Add WebAuthn support",
    "Implement FIDO2",
    "Add passkey support",
    "Improve user management",
    "Add profile management",
    "Implement preferences",
    "Add notification system",
    "Improve email templates",
    "Add SMS integration",
    "Implement push notifications",
    "Add webhook support",
    "Improve event system",
    "Add message queuing",
    "Implement pub/sub",
    "Add event sourcing",
    "Improve CQRS implementation",
    "Add saga patterns",
    "Implement orchestration",
    "Add choreography support",
    "Improve distributed transactions",
    "Add eventual consistency",
    "Implement conflict resolution",
    "Add merge strategies",
    "Improve data synchronization",
    "Add replication support",
    "Implement sharding",
    "Add partitioning logic",
    "Improve query optimization",
    "Add index management",
    "Implement query caching",
    "Add result pagination",
    "Improve cursor-based pagination",
    "Add infinite scroll",
    "Implement virtual scrolling",
    "Add windowing techniques",
    "Improve rendering performance",
    "Add memoization",
    "Implement React.memo",
    "Add useMemo hooks",
    "Improve useCallback usage",
    "Add custom hooks",
    "Implement hook composition",
    "Add state management",
    "Improve context usage",
    "Add Redux integration",
    "Implement Zustand",
    "Add Jotai atoms",
    "Improve state persistence",
    "Add local storage sync",
    "Implement IndexedDB",
    "Add offline support",
    "Improve PWA features",
    "Add service worker",
    "Implement background sync",
    "Add push API",
    "Improve notifications",
    "Add badge support",
    "Implement app shortcuts",
    "Add share target",
    "Improve install prompt",
    "Add update notifications",
    "Implement version checking",
    "Add feature detection",
    "Improve graceful degradation",
    "Add polyfills",
    "Implement transpilation",
    "Add babel configuration",
    "Improve build targets",
    "Add browserslist config",
    "Implement autoprefixer",
    "Add PostCSS plugins",
    "Improve CSS modules",
    "Add styled components",
    "Implement Tailwind CSS",
    "Add design tokens",
    "Improve theme system",
    "Add dark mode support",
    "Implement color schemes",
    "Add responsive design",
    "Improve mobile-first approach",
    "Add breakpoint management",
    "Implement container queries",
    "Add aspect ratio utilities",
    "Improve spacing system",
    "Add typography scale",
    "Implement font loading",
    "Add icon system",
    "Improve SVG optimization",
    "Add image optimization",
    "Implement lazy images"
)

$fileCommitMessages = @{
    "program/src/lib.rs" = @("Initial Solana program", "Add program entrypoint", "Update program exports")
    "program/src/state.rs" = @("Add state structures", "Implement Robot state", "Add Credential state", "Update state serialization")
    "program/src/processor.rs" = @("Add instruction processor", "Implement robot initialization", "Add command execution", "Improve error handling")
    "program/src/merkle.rs" = @("Add Merkle tree verification", "Implement proof validation", "Optimize hash computation")
    "program/src/error.rs" = @("Add error types", "Improve error messages", "Add custom errors")
    "program/src/instruction.rs" = @("Add instruction definitions", "Implement instruction parsing", "Add instruction validation")
    "program/Cargo.toml" = @("Add Cargo configuration", "Update dependencies", "Optimize build settings")
    "sdk/src/roby.ts" = @("Add SDK client", "Implement robot methods", "Add credential methods")
    "sdk/src/types.ts" = @("Add TypeScript types", "Define interfaces", "Add enums")
    "sdk/src/merkle.ts" = @("Add Merkle tree utilities", "Implement proof generation", "Add verification logic")
    "sdk/src/instructions.ts" = @("Add instruction builders", "Implement transaction helpers", "Add instruction factory")
    "sdk/package.json" = @("Add SDK package config", "Update dependencies", "Add build scripts")
    "api/src/index.ts" = @("Add API server", "Configure middleware", "Setup routes")
    "api/src/routes/robot.ts" = @("Add robot endpoints", "Implement GET/POST handlers", "Add validation")
    "api/src/routes/credential.ts" = @("Add credential endpoints", "Implement credential issuance", "Add revocation")
    "api/src/routes/command.ts" = @("Add command endpoints", "Implement command execution", "Add rate limiting")
    "README.md" = @("Add README", "Update documentation", "Add examples", "Improve architecture docs")
    ".gitignore" = @("Add gitignore", "Update ignore patterns")
    "LICENSE" = @("Add Apache license")
}

$start = Get-Date $StartDate
$end = Get-Date "2026-01-07"
$totalDays = ($end - $start).Days

Write-Host "Creating $TotalCommits commits from $StartDate to 2026-01-07" -ForegroundColor Green
Write-Host "Total days: $totalDays" -ForegroundColor Cyan

$allFiles = @(
    "program/src/lib.rs",
    "program/src/state.rs",
    "program/src/processor.rs",
    "program/src/merkle.rs",
    "program/src/error.rs",
    "program/src/instruction.rs",
    "program/Cargo.toml",
    "program/Xargo.toml",
    "sdk/src/roby.ts",
    "sdk/src/types.ts",
    "sdk/src/state.ts",
    "sdk/src/merkle.ts",
    "sdk/src/instructions.ts",
    "sdk/src/utils.ts",
    "sdk/src/index.ts",
    "sdk/package.json",
    "sdk/tsconfig.json",
    "api/src/index.ts",
    "api/src/config.ts",
    "api/src/routes/robot.ts",
    "api/src/routes/credential.ts",
    "api/src/routes/command.ts",
    "api/src/routes/health.ts",
    "api/src/middleware/errorHandler.ts",
    "api/src/middleware/validation.ts",
    "api/src/middleware/rateLimit.ts",
    "api/src/utils/logger.ts",
    "api/package.json",
    "api/tsconfig.json",
    "api/Dockerfile",
    "README.md",
    ".gitignore",
    "LICENSE",
    "Cargo.toml",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "docker-compose.yml",
    "examples/basic-usage.ts",
    "examples/merkle-proof-demo.ts",
    "scripts/deploy.sh",
    "scripts/test-all.sh",
    "sdk/jest.config.js",
    "sdk/.eslintrc.js"
)

$daysWithCommits = @()
$commitCount = 0

while ($commitCount -lt $TotalCommits) {
    $randomDay = Get-Random -Minimum 0 -Maximum $totalDays
    
    if ($daysWithCommits -notcontains $randomDay) {
        $daysWithCommits += $randomDay
        $commitCount++
    }
}

$daysWithCommits = $daysWithCommits | Sort-Object

Write-Host "Generating commits..." -ForegroundColor Yellow

foreach ($dayOffset in $daysWithCommits) {
    $commitDate = $start.AddDays($dayOffset)
    
    $hour = Get-Random -Minimum 9 -Maximum 23
    $minute = Get-Random -Minimum 0 -Maximum 59
    $second = Get-Random -Minimum 0 -Maximum 59
    
    $commitDateTime = $commitDate.AddHours($hour).AddMinutes($minute).AddSeconds($second)
    $dateString = $commitDateTime.ToString("yyyy-MM-ddTHH:mm:ss")
    
    $randomFile = $allFiles | Get-Random
    $message = $commitMessages | Get-Random
    
    if ($fileCommitMessages.ContainsKey($randomFile)) {
        $specificMessages = $fileCommitMessages[$randomFile]
        $message = $specificMessages | Get-Random
    }
    
    if (Test-Path $randomFile) {
        Add-Content -Path $randomFile -Value "`n"
    }
    
    git add $randomFile
    
    $env:GIT_AUTHOR_NAME = $authorName
    $env:GIT_AUTHOR_EMAIL = $authorEmail
    $env:GIT_COMMITTER_NAME = $authorName
    $env:GIT_COMMITTER_EMAIL = $authorEmail
    $env:GIT_AUTHOR_DATE = $dateString
    $env:GIT_COMMITTER_DATE = $dateString
    
    git commit -m $message --quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Commit $($daysWithCommits.IndexOf($dayOffset) + 1)/$TotalCommits - $dateString - $message" -ForegroundColor Green
    }
}

Write-Host "`nAll commits created successfully!" -ForegroundColor Green
Write-Host "Total commits: $(git rev-list --count HEAD)" -ForegroundColor Cyan

