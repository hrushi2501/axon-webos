variable "VERSION" {
  default = "dev"
}

variable "VCS_REF" {
  default = "unknown"
}

variable "BUILD_DATE" {
  default = "unknown"
}

group "default" {
  targets = ["api", "web"]
}

target "common" {
  context = "."
  platforms = ["linux/amd64", "linux/arm64"]
  attest = [
    "type=provenance,mode=max",
    "type=sbom"
  ]
  args = {
    BUILD_DATE = BUILD_DATE
    VCS_REF = VCS_REF
    VERSION = VERSION
  }
}

target "api" {
  inherits = ["common"]
  dockerfile = "apps/api/Dockerfile"
  tags = ["axon-webos-api:${VERSION}"]
}

target "web" {
  inherits = ["common"]
  dockerfile = "apps/web/Dockerfile"
  tags = ["axon-webos-web:${VERSION}"]
  args = {
    NEXT_PUBLIC_API_WS_URL = "ws://localhost:3001/ws"
  }
}
