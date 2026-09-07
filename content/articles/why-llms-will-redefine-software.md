---
readTime: 2
title: "Why LLMs will change how we build software"
date: "2026-01-12"
description: "A perspective on faster experimentation, small teams, and the engineering judgment needed to turn generated code into useful software."
categories: ["AI", "LLM"]
---

I think large language models will change how we build software by making it easier to try an idea, inspect an unfamiliar codebase, and produce a first implementation.

In [Don't fall into the anti-AI hype](https://antirez.com/news/158), Antirez makes an optimistic case for the tools, including their potential to help small teams compete. His comparison with open source is the part that stays with me: changing access to tools can change who gets to build.

My own takeaway is about the cost of experimentation. When a rough implementation is easier to produce, a small team can explore more possibilities. A developer can try a different interface or investigate an approach that would previously have stayed on the backlog.

That is a possibility to test, not a guarantee of better software.

## Faster code needs a feedback loop

A generated implementation still needs to fit the system around it. Does it handle failures? Respect permissions? Preserve existing behavior? Solve the user's problem?

For example, imagine using an LLM to draft a document search feature. A working search box is a useful beginning. The real assessment comes from realistic queries, missing documents, permission boundaries, and whether people can find what they need.

The benefit depends on the whole cycle: drafting, reviewing, testing, and maintaining. Time saved in the first step can disappear if the team accepts plausible code without understanding it.

## What small teams can do with that

I would start with a narrow workflow, establish how it performs today, and measure the result after introducing AI assistance. Keep examples of both successful and failed changes. Count review and rework time alongside implementation time.

The opportunity I see is more room to experiment while keeping ownership of the outcome. Product judgment, technical understanding, and a good feedback loop become more valuable when there are more possible implementations to choose from.

Open source expanded access to the building blocks of software. I think LLMs can expand access to implementation help. What we make of that still depends on the choices we make and the evidence we collect.
