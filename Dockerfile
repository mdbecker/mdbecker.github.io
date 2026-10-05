FROM ruby:3.3.12-bookworm

ENV BUNDLE_FROZEN=true \
    BUNDLE_PATH=/usr/local/bundle \
    JEKYLL_ENV=development

RUN gem install bundler -v 4.0.22 --no-document

WORKDIR /site
COPY Gemfile Gemfile.lock ./
RUN bundle _4.0.22_ install

EXPOSE 4000
CMD ["bundle", "_4.0.22_", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--destination", "/tmp/public", "--force_polling"]
