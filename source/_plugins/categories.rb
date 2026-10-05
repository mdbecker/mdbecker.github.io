# frozen_string_literal: true

# Keep historical category paths and their Atom feeds using Jekyll's public API.
class HistoricalCategories < Jekyll::Generator
  safe true
  priority :high

  def generate(site)
    # Keep historical lowercase category paths while retaining source order.
    site.posts.docs.each do |post|
      post.data["categories"] = Array(post.data["categories"]).map { |category| category.to_s.downcase }
    end

    site.categories.each do |category, _posts|
      slug = Jekyll::Utils.slugify(category.downcase.tr(' ', '-').gsub('.', '-dot-'))
      next if slug.empty?

      directory = File.join(site.config.fetch('category_dir'), slug)
      page = Jekyll::PageWithoutAFile.new(site, site.source, directory, 'index.html')
      page.data.merge!('layout' => 'category_index', 'category' => category,
                       'title' => "Category: #{category}",
                       'display_title' => "Category: #{category.split.map(&:capitalize).join(' ')}")
      site.pages << page

      feed = Jekyll::PageWithoutAFile.new(site, site.source, directory, 'atom.xml')
      feed.content = '{% include custom/category_feed.xml %}'
      feed.data.merge!('layout' => nil, 'category' => category,
                       'title' => "Category: #{category}", 'feed_url' => "#{directory}/atom.xml")
      site.pages << feed
    end
  end
end
