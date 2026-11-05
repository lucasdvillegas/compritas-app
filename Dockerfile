# syntax=docker/dockerfile:1.7

# Android release build for Compritapp (Quasar + Cordova).
#
# The build tools of the Android SDK are distributed for x86_64 Linux, so the
# platform is pinned. On Apple Silicon Docker Desktop runs this through Rosetta.
FROM --platform=linux/amd64 node:22-bookworm AS build

ARG QCLI_API_URL
ARG ANDROID_BUILD_TYPE=release
ARG ANDROID_PACKAGE_TYPE=bundle
ARG ANDROID_PLATFORM=36
ARG ANDROID_BUILD_TOOLS=36.0.0
ARG GRADLE_VERSION=8.14.2
ARG CORDOVA_ANDROID_VERSION=15.1.0

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx4g -Dorg.gradle.daemon=false"
ENV PATH="$JAVA_HOME/bin:/opt/gradle/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/$ANDROID_BUILD_TOOLS:$PATH"

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git openjdk-17-jdk-headless unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" -o /tmp/gradle.zip \
    && unzip -q /tmp/gradle.zip -d /opt \
    && ln -s "/opt/gradle-${GRADLE_VERSION}" /opt/gradle \
    && rm /tmp/gradle.zip

RUN mkdir -p "${ANDROID_HOME}/cmdline-tools" \
    && curl -fsSL "https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip" -o /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools \
    && mv /tmp/cmdline-tools/cmdline-tools "${ANDROID_HOME}/cmdline-tools/latest" \
    && rm -rf /tmp/cmdline-tools /tmp/cmdline-tools.zip \
    && yes | sdkmanager --licenses >/dev/null \
    && sdkmanager "platform-tools" "platforms;android-${ANDROID_PLATFORM}" "build-tools;${ANDROID_BUILD_TOOLS}"

RUN npm install --global cordova@13.0.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npx quasar prepare --silent
RUN test -n "${QCLI_API_URL}"
RUN cd src-cordova && cordova platform add "android@${CORDOVA_ANDROID_VERSION}"

RUN npx quasar build -m cordova -T android --skip-pkg

# Signing is optional. Mount a Cordova build.json and the keystore as BuildKit
# secrets; build.json must reference /run/secrets/android_keystore.
RUN --mount=type=secret,id=android_build_json,required=false \
    --mount=type=secret,id=android_keystore,required=false \
    cd src-cordova \
    && if [ -f /run/secrets/android_build_json ]; then cp /run/secrets/android_build_json build.json; fi \
    && cordova build android --${ANDROID_BUILD_TYPE} --device -- --packageType="${ANDROID_PACKAGE_TYPE}"

FROM scratch AS export
COPY --from=build /app/src-cordova/platforms/android/app/build/outputs /android
