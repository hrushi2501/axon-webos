FROM rust:1.75 as builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/webos-api /app/webos-api
EXPOSE 3001
CMD ["./webos-api"]
