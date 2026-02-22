FROM alpine:3.19.1@sha256:1111111111111111111111111111111111111111111111111111111111111111

# Install only the runtime packages required by the sandbox
RUN apk add --no-cache nodejs npm git

# Create a non-root user for safer execution
RUN adduser -D -u 1001 agent

WORKDIR /workspace

# Drop privileges before runtime
USER agent
