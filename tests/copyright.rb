# Run inside Docker: docker compose exec -T blog bundle exec ruby tests/copyright.rb
require "jekyll"
require "tmpdir"

Dir.mktmpdir("copyright-regression-") do |destination|
  [2026, 2027].product(["Michael Becker", { "name" => "Michael Becker" }]).each do |year, author|
    config = Jekyll.configuration(
      "destination" => destination,
      "time" => "#{year}-06-01 12:00:00 +0000",
      "author" => author,
      "disable_disk_cache" => true,
      "quiet" => true
    )
    Jekyll::Site.new(config).process
    html = File.read(File.join(destination, "index.html"))
    footer = html[/<footer\b.*?<\/footer>/m] or raise "Missing footer"
    expected = "&copy; 2013–#{year} Michael Becker"
    raise "Expected #{expected.inspect} for #{author.inspect}, got #{footer}" unless footer.include?(expected)
    puts "PASS: #{year} build with #{author.is_a?(Hash) ? 'structured' : 'string'} author"
  end
end
