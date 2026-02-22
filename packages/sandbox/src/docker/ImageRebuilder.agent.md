Intent: ImageRebuilder reconstructs the sandbox base image from docker/base/Dockerfile when pre-built images are unavailable.

Architecture:
- rebuild() reads image-manifest.json for baseImage and digest.
- Calls docker.buildImage({ context: path.resolve('./docker/base'), src: ['Dockerfile'] }, { t: manifest.baseImage, nocache: true }).
- Streams build output to logger and inspects the rebuilt image's RepoDigests.
- Throws DigestMismatchError if none of RepoDigests ends with @<manifest.digest> to ensure supply-chain integrity.
