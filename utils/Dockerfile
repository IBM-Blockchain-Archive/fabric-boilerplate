FROM node:6

RUN mkdir -p /usr/src/app

#### INSTALLING CF-CLI ####
ENV CFCLI_VERSION 6.26.0
ENV CFCLI_DOWNLOAD_URL https://cli.run.pivotal.io/stable?release=linux64-binary&version=$CFCLI_VERSION
ENV CFCLI_DOWNLOAD_SHA256 5e9018d965e94ef34047346170c8b487bdcaecacd3860c06cf7adbfa3145fab2

RUN curl -fsSL "$CFCLI_DOWNLOAD_URL" -o cf-cli.tgz \
    && echo "$CFCLI_DOWNLOAD_SHA256  cf-cli.tgz" | sha256sum -c - \
    && tar -C /usr/bin -xzf cf-cli.tgz \
    && chmod ugo+rx /usr/bin/cf \
    && rm cf-cli.tgz
#######################

#### INSTALLING GO ####
# gcc for cgo
RUN apt-get update && apt-get install -y --no-install-recommends \
		g++ \
		gcc \
		libc6-dev \
		make \
		pkg-config \
		git \
	&& rm -rf /var/lib/apt/lists/*

ENV GOLANG_VERSION 1.8.1
ENV GOLANG_DOWNLOAD_URL https://golang.org/dl/go$GOLANG_VERSION.linux-amd64.tar.gz
ENV GOLANG_DOWNLOAD_SHA256 a579ab19d5237e263254f1eac5352efcf1d70b9dacadb6d6bb12b0911ede8994

RUN curl -fsSL "$GOLANG_DOWNLOAD_URL" -o golang.tar.gz \
	&& echo "$GOLANG_DOWNLOAD_SHA256  golang.tar.gz" | sha256sum -c - \
	&& tar -C /usr/local -xzf golang.tar.gz \
	&& rm golang.tar.gz

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"
#######################

#### INSTALLING GOVEND ####
RUN go get -u github.com/govend/govend
#######################

WORKDIR /usr/src/app

EXPOSE 8080