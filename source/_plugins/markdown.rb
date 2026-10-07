# frozen_string_literal: true

require "jekyll/converters/markdown/kramdown_parser"
require "rouge"
require "cgi"

# jekyll-toc's filters require page.toc == true, even when called explicitly.
# Enable the existing parser for readable page/post layouts without author flags.
Jekyll::Hooks.register [:pages, :documents], :pre_render do |document, payload|
  if %w[page post].include?(document.data["layout"]) && !document.data["redirect_to"]
    payload["page"]["toc"] = true
  end
end

# Jekyll's documented custom Markdown processor delegates prose to Kramdown.
# The retained stylesheet expects the historical code table and line gutter.
class Jekyll::Converters::Markdown::HistoricalKramdown
  def initialize(config)
    @kramdown = Jekyll::Converters::Markdown::KramdownParser.new(config)
    @formatter = Rouge::Formatters::HTML.new
  end

  def convert(content)
    blocks = []
    prepared = content.gsub(/^```[ \t]*([^\n]*)\n(.*?)^```[ \t]*(?:\n|\z)/m) do
      language = Regexp.last_match(1).strip
      code = Regexp.last_match(2).delete_suffix("\n")
      blocks << code_table(code, language)
      "\n\n<!--historical-code-#{blocks.length - 1}-->\n\n"
    end
    prepared = preserve_quotes(prepared)
    prepared.gsub!(/<!--historical-code-(\d+)-->/) { blocks[Regexp.last_match(1).to_i] }
    @kramdown.convert(prepared)
  end

  private

  def preserve_quotes(content)
    # Already written typography is content, not a request to infer new quotes.
    # Leave inline code and HTML tags alone, as Kramdown does for normal prose.
    content.split(/(`+[^`]*`+|<[^>]*>)/m).each_with_index.map do |part, index|
      next part if index.odd?

      part.gsub(/[“”‘’]/) { |quote| "&##{quote.ord};" }
        # The old formatter did not recognize NBSP as opening-quote whitespace.
        # Preserve its literal opener and the inferred left quote at the end.
        .gsub(/(\u00a0|&nbsp;)"([^"\n]*)"/, '\\1&quot;\\2&#8220;')
        .gsub(/(\u00a0|&nbsp;)"/, '\\1&quot;')
        .gsub(/\b([sld])'(?=[[:alpha:]])/i, '\\1&#39;')
    end.join
  end

  def code_table(code, language)
    lexer = Rouge::Lexer.find_fancy(language, code) || Rouge::Lexers::PlainText.new
    lines = [+""]
    # Split highlighted tokens, rather than lexing each line independently:
    # multiline strings keep their meaning and every line has balanced spans.
    lexer.lex(code + "\n").each do |token, value|
      value.split("\n", -1).each_with_index do |part, index|
        lines << +"" if index.positive?
        lines.last << @formatter.span(token, part) unless part.empty?
      end
    end
    lines.pop # The trailing newline terminates the final source line.
    gutter = lines.each_index.map { |index| "<span class='line-number'>#{index + 1}</span>\n" }.join
    highlighted = lines.map { |line| "<span class='line'>#{line}\n</span>" }.join
    "<div class='bogus-wrapper'><notextile><figure class='code'>" \
      "<figcaption><span></span></figcaption><div class='highlight'><table><tr>" \
      "<td class='gutter'><pre class='line-numbers'>#{gutter}</pre></td>" \
      "<td class='code'><pre><code class='#{CGI.escapeHTML(language)}'>#{highlighted}" \
      "</code></pre></td></tr></table></div></figure></notextile></div>"
  end
end
