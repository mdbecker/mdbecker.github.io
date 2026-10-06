---
layout: page
title: Talks
comments: false
---
Talks on Python, production machine learning, healthcare, and open-source collaboration.

{% assign talks = site.talks | sort: 'order' %}
{% for talk in talks %}{% include talk.html talk=talk %}{% endfor %}
