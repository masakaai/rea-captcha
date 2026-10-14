# Model licenses

No model weights are redistributed by this repository.

The optional ddddocr adapter was reviewed against upstream commit `c40f56f95412e10bcb9bd0bd24411e92f896d238` (ddddocr 1.6.1). The upstream repository declares MIT for its software. It does not provide a separate model-weight license in the reviewed root license, so users must review the exact package and weights they install before redistributing them. The local manifest records this uncertainty instead of describing all resources as MIT.

Any future ONNX or VLM backend must provide source URL, immutable digest, code license, weight license, redistribution status, and tested runtime version in `models/manifests/` before integration.
