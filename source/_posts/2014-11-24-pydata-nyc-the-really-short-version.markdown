---
layout: post
title: "PyData NYC: The Really Short Version"
date: 2014-11-24 19:13
comments: true
categories: [Python, PyData, Conferences, Open Source, Community] 
---

Here are my notes from PyData with links for more details. This isn't a complete list, and in some cases my notes don't really do justice to the actual talks, but I hope that these will be helpful to anyone who's feeling [PyData FOMO](https://twitter.com/jrmontag/status/536221698937217024) until the videos are released.

_Disclaimer: I took almost no notes on the second day so a bunch of my favorite talks are missing._

[![](https://pbs.twimg.com/media/B24Y568IQAA5AEf.png)](http://pydata.org/nyc2014)

# [High Performance Text Processing with Rosetta](http://pydata.org/nyc2014/abstracts/#278)
This library is a highly optimized NLP library with a focus on memory efficiency.

* [TextFileStreamer](http://pythonhosted.org/rosetta/#rosetta.text.streamers.TextFileStreamer) - provides a streaming tokenizer. Good for memory efficiency.
* [DBStreamer](http://pythonhosted.org/rosetta/#rosetta.text.streamers.DBStreamer)&nbsp;- Ditto but for data in a DB.
* Can be easily combined with online learning methods.
* An IPython notebook with example code can be [found here](http://nbviewer.ipython.org/github/columbia-applied-data-science/rosetta/blob/master/notebooks/BrightTalk.ipynb).

# [Python in the Hadoop/Spark Ecosystem](http://pydata.org/nyc2014/keynotes/#abstract_303)
[![](https://pbs.twimg.com/media/B3DcSIBIcAEt4V2.jpg)](https://twitter.com/teoliphant/status/536170567729442816)

* [Bcolz](https://github.com/Blosc/bcolz) - A columnar data container that can be compressed (supported by [Blaze](http://blaze.pydata.org/docs/latest/index.html)).
* [Impyla](https://github.com/cloudera/impyla) - Python client and [Numba](http://numba.pydata.org/)-based [UDFs](http://www.cloudera.com/content/cloudera/en/documentation/cloudera-impala/latest/topics/impala_udf.html) for Impala.
* [Streamparse](https://github.com/Parsely/streamparse) - lets you run Python code against real-time streams of data. Integrates with [Apache Storm](https://storm.apache.org/).
* [Kafka-python](https://github.com/mumrah/kafka-python)&nbsp;-&nbsp;[Kafka](https://kafka.apache.org/) protocol support in Python.
* [Anaconda cluster](http://continuum.io/anaconda-cluster) - Bringing the Python ecosystem to Hadoop and Spark.
* [Libcloud](https://libcloud.apache.org/) - Python library for interacting with many of the popular cloud service providers using a unified API.

# [Data warehouse and conceptual modelling with Cubes 1.0](http://pydata.org/nyc2014/abstracts/#290)
Light-weight Python framework and [OLAP](https://en.wikipedia.org/wiki/Online_analytical_processing) HTTP server for easy development of reporting applications and aggregate browsing of multi-dimensionally modeled data. [The slides for this talk are already online](https://twitter.com/Stiivi/status/536541681026621443).

* Works best with aggregating categorical data.
* [Cubes visualizer](https://github.com/DataBrewery/cubes/blob/master/Visualizer.md) - Cubes Visualizer is an application for browsing and visualizing data from a cubes Slicer server.
* Has [Google analytics](https://pythonhosted.org/cubes/backends/google_analytics.html) support built-in (good way to drill into google analytics data?).
* [Cubesviewer](https://github.com/jjmontesl/cubesviewer) - Visual tool for exploring and analyzing OLAP databases.
* [http://checkgermany.de/](http://checkgermany.de/) - example application.

# [How to Make Your Future Data Scientists Love You](http://pydata.org/nyc2014/abstracts/#330)

[![](https://pbs.twimg.com/media/B3D7m_HIMAAvOEe.jpg)](https://twitter.com/clearspandex/status/536205002931716096)

Excellent talk with common mistakes made by many companies, and how to avoid making Data Science hard or impossible in the future. My notes on this talk don't really do it justice, so please see [Sasha's blog](http://blog.sashalaundy.com/talks/data-audit/) for more details.

* Is your data set complete?
* Is your data correct?
* Is your data connectable?

Command-line utilities for exploring your data:

* [csvkit](https://csvkit.readthedocs.org/en/0.9.0/)
* bitly data_hacks - [histogram.py](https://github.com/bitly/data_hacks#histogrampy)

# [Recalling with precision](http://pydata.org/nyc2014/speakers/#122)
Awesome talk about measuring and tracking predictive model performance. The speaker Julia open sourced the web app they developed at Stripe called "[top model](https://github.com/stripe/topmodel)" right before her talk.

# [Simple Machine Learning with SKLL 1.0](http://pydata.org/nyc2014/abstracts/#277)
[SKLL](https://scikit-learn-laboratory.readthedocs.org/en/latest/) is a wrapper around scikit-learn that makes prototyping predictive algorithms as easy as creating a CSV and running a python script. I got a chance to talk extensively with the author and it seems like they’ve done a good job of handling most of the typical gotchas of scikit-learn.

**That’s all for now, I’ll send out an update once the videos are live.**