---
layout: post
title: "Working with email content"
date: 2013-02-14 22:23
comments: true
categories: [Text Processing, Data Science, Natural Language Processing, Predictive Analysis, Machine Learning, Feature Extraction, Data Mining, Python, nltk, html]
---
When it comes to [tokenization](http://goo.gl/F2i6l "Wikipedia: Tokenization"), email content presents some unique challenges. Some messages have a plain text version, some have a HTML version, and some have both. Before you can do cool things with this data like [natural language processing](http://goo.gl/X0vQ "Wikipedia: NLP") or [predictive analysis](http://goo.gl/X9l0z "Wikipedia: Predictive Analytics"), you have to convert the data into a uniform format (sometimes referred to as [scrubbing](http://goo.gl/bMqGP)) prior to tokenization. In my case, I wanted all of my data to be plain text.

If you have a plain text version of the email, it is probably safe to use it without scrubbing. However if you encounter an e-mail without a plain text version, you'll need to convert the HTML version to text. [Searching the web](http://goo.gl/wnRiJu "search &quot;python convert html to text&quot;"), you're likely to find a myriad of solutions for converting HTML to text. Python is my language of choice, and a few suggestions I found used [lxml](http://goo.gl/xBDJZ "lxml website"), [BeautifulSoup](http://goo.gl/YUOe "BeautifulSoup website"), and [nltk](http://goo.gl/JGYNk "Natural Language Toolkit website") to convert HTML to text.

### lxml and soupparser, an exercise in futility

lxml has a [Cleaner](http://lxml.de/api/lxml.html.clean.Cleaner-class.html "lxml cleaner class") class which "cleans the document of each of the possible offending elements." The biggest problem with using lxml is it doesn't handle malformed HTML gracefully. To handle these edge cases, you can use the lxml [soupparser](http://lxml.de/elementsoup.html) to parse malformed HTML. While in most cases this will work without error, it doesn't produce the desired results for all input. For example, in the following case soupparser will produce an empty HTML document even though there is clearly text in the data:
``` python
from lxml.etree import tostring
from lxml.html.soupparser import fromstring

data = '</form all my text is at the end of this malformed html'
root = fromstring(data)
print tostring(root)

'<html/>'
```
This is because the default HTML parser used by BeautifulSoup is the built-in HTMLParser. As the BeautifulSoup4 docs point out, in older versions (before 2.7.3 or 3.2.2) "Python’s built-in HTML parser is just not very good". Now there are work arounds to this. If you're using BeautifulSoup4, you can [specify a different parser](http://www.crummy.com/software/BeautifulSoup/bs4/doc/#installing-a-parser "bs4 3rd party parser documentation") to use, which will provide better results. This all seems like a lot of work to convert HTML to text, isn't there a better way?

### nltk.util.clean_html is full of win!

Enter [nltk.util.clean_html](http://nltk.org/book/ch03.html#dealing-with-html "nltk.util.clean_html"). clean_html uses regular expressions to strip HTML tags from text. This approach helps avoid the issues found with lxml and BeautifulSoup. Looking at our previous example, we don't lose our text data using clean_html:

![NLTK is full of win!](http://cdn.memegenerator.net/instances/400x/34904914.jpg)
``` python
from nltk import clean_html

data = '</form all my text is at the end of this malformed html'
print clean_html(root)

'</form all my text is at the end of this malformed html'
```
Looking at [the implementation](http://nltk.org/_modules/nltk/util.html#clean_html "clean_html source code"), it almost seems too simple. There are six regular expressions, and that's it! I've tested all three solutions against several million real e-mail messages, and in all cases nltk provided the best results.

Sifting through all the possible solutions for converting HTML to text and testing each of them was pretty time consuming. If your goal is to scrub the HTML for further analysis, nltk clean_html is definitely the way to go!
